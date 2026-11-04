import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createUiAccess } from "../security/ui-access.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(
  await readFile(path.join(root, "dist/.vite/manifest.json")),
);
const policy = JSON.parse(
  await readFile(path.join(root, "dist/.security/ui-policy.json")),
);
const seen = new Set();
function visit(key) {
  if (seen.has(key)) return;
  seen.add(key);
  const item = manifest[key];
  assert.ok(item, key);
  assert.ok(
    !item.file.startsWith("protected/"),
    "Public entry eagerly imports private UI: " + key,
  );
  for (const dependency of item.imports || []) visit(dependency);
}
for (const [key, item] of Object.entries(manifest))
  if (item.isEntry) visit(key);
for (const [key, item] of Object.entries(manifest)) {
  if (key.startsWith("src/pages/authenticated/"))
    assert.match(item.file, /^protected\/member\//);
  if (key === "src/routes/PrivateRoutes.tsx")
    assert.match(item.file, /^protected\/dashboard\//);
  if (key === "src/pages/private/QRProductDashboardPage.tsx")
    assert.equal(policy.files["/" + item.file], "qr-products");
  if (
    /^src\/pages\/private\/(?:AccountDashboard|HubClient(?:Create|Dashboard|Edit)|Storage(?:Dashboard|FolderDetail)|License(?:Create|Edit|Detail|List|Support)|SystemSettingDashboard)Page\.tsx$/.test(
      key,
    )
  )
    assert.equal(policy.files["/" + item.file], "admin");
}
for (const [key, scope] of [
  ["src/pages/private/QRProductGeneratorPage.tsx", "qr-products"],
  ["src/pages/private/QRProductEditPage.tsx", "qr-products"],
  ["src/pages/private/CatalogueCreatePage.tsx", "catalogue"],
  ["src/pages/private/CatalogueEditPage.tsx", "catalogue"],
]) {
  assert.ok(manifest[key], key);
  assert.equal(policy.files["/" + manifest[key].file], scope);
  assert.ok(policy.scopeRoles[scope].includes("marketing"));
  assert.ok(!policy.scopeRoles[scope].includes("finance"));
  // Every static import needed by the tool must be deliverable to marketing.
  const visited = new Set();
  function checkImports(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const chunk = manifest[id],
      grant = policy.files["/" + chunk.file];
    if (grant && grant !== "member")
      assert.ok(policy.scopeRoles[grant].includes("marketing"), id);
    for (const dependency of chunk.imports || []) checkImports(dependency);
  }
  checkImports(key);
}
assert.deepEqual(policy.scopeRoles.admin, ["admin"]);
assert.ok(policy.dashboardRoles.includes("marketing"));
assert.ok(!policy.scopeRoles.overview.includes("marketing"));
assert.ok(Object.values(policy.files).includes("member"));
assert.ok(Object.values(policy.files).includes("dashboard"));
console.log(
  "PASS: public static graph excludes private screens; directory scopes generated automatically",
);
let revoked = false,
  failCore = false;
const events = [];
const service = createUiAccess({
  policy,
  log: (event) => events.push(event),
  fetchImpl: async (_url, options) => {
    const token = options.headers.Cookie;
    if (failCore) return new Response("{}", { status: 503 });
    if (
      revoked ||
      ![
        "token=fixture-admin",
        "token=fixture-member",
        "token=fixture-inactive",
        "token=fixture-marketing",
        "token=fixture-business_development",
        "token=fixture-finance",
        "token=fixture-ceo",
        "token=fixture-hr",
        "token=fixture-admin_brand",
      ].includes(token)
    )
      return new Response("{}", { status: 401 });
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userId:
            token === "token=fixture-admin"
              ? "admin-one"
              : token === "token=fixture-member"
                ? "member-one"
                : token.slice("token=fixture-".length),
          role:
            token === "token=fixture-admin"
              ? "admin"
              : ["token=fixture-member", "token=fixture-inactive"].includes(
                    token,
                  )
                ? "warehouse"
                : token.slice("token=fixture-".length),
          status: token.includes("inactive") ? "INACTIVE" : "ACTIVE",
        },
      }),
    );
  },
});
await new Promise((resolve) => service.listen(0, "127.0.0.1", resolve));
const servicePort = service.address().port;
const nginxBin = process.env.NGINX_BIN || "nginx";
assert.equal(
  spawnSync(nginxBin, ["-v"]).status,
  0,
  "Set NGINX_BIN to nginx with auth_request",
);
const temp = await mkdtemp(path.join(tmpdir(), "hub-ui-check-"));
await mkdir(path.join(temp, "logs"));
// Let Nginx choose its own unallocated port after a short reservation.
const reservation = createUiAccess({ policy, log: () => {} });
await new Promise((r) => reservation.listen(0, "127.0.0.1", r));
const port = reservation.address().port;
await new Promise((r) => reservation.close(r));
let nginx;
let stderr = "";
let checks = 0;
try {
  let config = await readFile(path.join(root, "nginx.conf"), "utf8");
  config = config
    .replace("listen 80;", `listen 127.0.0.1:${port};`)
    .replaceAll("/usr/share/nginx/html", path.join(root, "dist"))
    .replaceAll("hub-ui-access:8080", `127.0.0.1:${servicePort}`);
  const conf = path.join(temp, "nginx.conf");
  await writeFile(
    conf,
    `daemon off;master_process off;pid ${temp}/nginx.pid;error_log stderr;events{}http{types{application/javascript js;text/css css;text/html html;font/woff2 woff2;}access_log off;${config}}`,
  );
  const syntax = spawnSync(nginxBin, ["-t", "-p", temp, "-c", conf], {
    encoding: "utf8",
  });
  assert.equal(syntax.status, 0, syntax.stderr);
  nginx = spawn(nginxBin, ["-p", temp, "-c", conf], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  nginx.stderr.on("data", (d) => (stderr += d));
  const base = `http://127.0.0.1:${port}`;
  for (let n = 0; n < 50; n++) {
    try {
      await fetch(base + "/login");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  const admin = { Cookie: "token=fixture-admin" },
    member = { Cookie: "token=fixture-member" },
    fake = { Cookie: "token=made-up" },
    spoof = {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://hub.picare.vn/pimory",
      "X-Ui-Actor": "admin-one",
    };
  async function check(uri, status, headers = {}, privateCache = false) {
    const result = await fetch(base + uri, { headers, redirect: "manual" });
    assert.equal(
      result.status,
      status,
      `${uri}: ${result.status} != ${status}; ${stderr}`,
    );
    if (privateCache)
      assert.match(result.headers.get("cache-control"), /private, no-store/);
    await result.arrayBuffer();
    checks++;
    return result;
  }
  for (const uri of [
    "/",
    "/login",
    "/login/client",
    "/contracts/example/sign-partner",
  ])
    await check(uri, 200);
  for (const uri of [
    "/pimory",
    "/catalogue/public/gallery",
    "/catalogue/public/43b04bae-410d-48c9-89e3-7897c5e5ea94",
    "/dashboard",
    "/dashboard/accounts",
    "/catalogue/create",
    "/contracts/create",
    "/qr-products/generator",
  ]) {
    await check(uri, 302, spoof, true);
    await check(uri, 302, fake, true);
    await check(uri, 200, admin, true);
  }
  await check("/dashboard", 403, member, true);
  const marketing = { Cookie: "token=fixture-marketing" },
    business = { Cookie: "token=fixture-business_development" },
    finance = { Cookie: "token=fixture-finance" };
  for (const uri of [
    "/qr-products/generator",
    "/qr-products/example/edit",
    "/catalogue/create",
    "/catalogue/example/edit",
  ]) {
    await check(uri, 200, marketing, true);
    await check(uri, 200, business, true);
    await check(uri, 403, finance, true);
    await check(uri, 403, member, true);
    await check(uri, 403, { Cookie: "token=fixture-inactive" }, true);
  }
  for (const uri of [
    "/dashboard/accounts",
    "/dashboard/storage",
    "/dashboard/storage/example",
    "/dashboard/hub-clients",
    "/dashboard/hub-clients/create",
    "/dashboard/licenses",
    "/dashboard/licenses/create",
    "/dashboard/licenses/example/edit",
    "/dashboard/settings/system",
    "/dashboard/summary",
    "/contracts/create",
  ])
    await check(uri, 403, marketing, true);
  for (const uri of [
    "/dashboard",
    "/dashboard/qr-products",
    "/dashboard/settings",
    "/dashboard/settings/security",
  ]) {
    await check(uri, 200, marketing, true);
    await check(uri, 200, business, true);
  }
  await check("/dashboard/qr-products", 403, finance, true);
  for (const uri of [
    "/dashboard/accounts",
    "/dashboard/storage",
    "/dashboard/hub-clients",
    "/dashboard/licenses",
    "/dashboard/settings/system",
  ]) {
    await check(uri, 403, business, true);
    await check(uri, 403, finance, true);
    await check(uri, 200, admin, true);
  }
  await check("/qr-products/generator?source=fixture", 200, marketing, true);
  for (const role of ["ceo", "hr", "admin_brand"]) {
    const headers = { Cookie: "token=fixture-" + role };
    await check("/dashboard", 200, headers, true);
    await check("/dashboard/qr-products", 403, headers, true);
    for (const uri of [
      "/dashboard/accounts",
      "/dashboard/storage",
      "/dashboard/hub-clients",
      "/dashboard/licenses",
      "/dashboard/settings/system",
    ])
      await check(uri, 403, headers, true);
    for (const [file, scope] of Object.entries(policy.files))
      if (scope === "admin") await check(file, 403, headers, true);
  }
  const firstMember = Object.keys(policy.files).find(
    (name) => policy.files[name] === "member",
  );
  const firstDashboard = Object.keys(policy.files).find(
    (name) => policy.files[name] === "dashboard",
  );
  for (const [uri, scope] of Object.entries(policy.files)) {
    await check(uri, 401, spoof, true);
    await check(uri, 401, fake, true);
    await check(uri, 200, admin, true);
    await check(uri, scope === "member" ? 200 : 403, member, true);
    await check(
      uri,
      scope === "member" || policy.scopeRoles[scope].includes("marketing")
        ? 200
        : 403,
      marketing,
      true,
    );
    await check(
      uri,
      scope === "member" ||
        policy.scopeRoles[scope].includes("business_development")
        ? 200
        : 403,
      business,
      true,
    );
    await check(
      uri,
      scope === "member" || policy.scopeRoles[scope].includes("finance")
        ? 200
        : 403,
      finance,
      true,
    );
  }
  await check(firstDashboard, 403, { Cookie: "token=fixture-inactive" }, true);
  await check("/_private_ui_auth", 404);
  await check("/__ui/authorize", 404);
  await check("/.security/ui-policy.json", 404);
  await check("/.vite/manifest.json", 404);
  const trace = await fetch(base + "/__ui/session?path=%2Fpimory", {
    headers: member,
  });
  const traceBody = await trace.json();
  assert.match(traceBody.data.auditId, /^[a-f0-9]{16}$/);
  await check("/__ui/session?path=%2Fdashboard", 403, member, true);
  revoked = true;
  await check(firstMember, 401, admin, true);
  revoked = false;
  const toolFile =
    "/" + manifest["src/pages/private/QRProductGeneratorPage.tsx"].file;
  revoked = true;
  await check(toolFile, 401, marketing, true);
  revoked = false;
  failCore = true;
  await check(toolFile, 503, marketing, true);
  await check(firstMember, 503, admin, true);
  failCore = false;
  // Optional browser exercise used by the local integration harness.
  if (process.env.UI_BROWSER_CHECK) {
    const { run } = await import(process.env.UI_BROWSER_CHECK);
    await run({ base, policy, admin, member, marketing });
  }
  let throttled = false;
  for (let n = 0; n < 190; n++) {
    const response = await fetch(base + firstMember, { headers: admin });
    await response.arrayBuffer();
    if (response.status === 429) {
      throttled = true;
      assert.equal(response.headers.get("retry-after"), "60");
      break;
    }
  }
  assert.ok(throttled, "Per-account download burst must be throttled");
  assert.ok(events.some((e) => e.status === 429 && e.userId === "admin-one"));
  assert.ok(events.some((e) => e.status === 403 && e.userId === "member-one"));
  assert.ok(
    !JSON.stringify(events).includes("fixture-admin"),
    "Audit log must not contain session tokens",
  );
  assert.ok(
    events.every((e) => !e.path.includes("?")),
    "Audit log must exclude query strings",
  );
  console.log(
    `PASS: ${checks} Nginx checks; roles, spoofed headers, expired/revoked sessions, Core outage, account rate limit and safe audit logging`,
  );
} finally {
  if (nginx && nginx.exitCode === null) {
    const exited = once(nginx, "exit");
    nginx.kill("SIGTERM");
    await exited;
  }
  await new Promise((r) => service.close(r));
  await rm(temp, { recursive: true, force: true });
}
