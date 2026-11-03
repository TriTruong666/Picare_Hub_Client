import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(
  await readFile(path.join(root, "dist/.vite/manifest.json"), "utf8"),
);
const pimory = manifest["src/pages/public/PimoryPage.tsx"];
const cataloguePreview =
  manifest["src/pages/public/CataloguePublicPreviewPage.tsx"];
const catalogueGallery =
  manifest["src/pages/public/CataloguePublicGalleryPage.tsx"];
for (const [name, chunk] of Object.entries({
  pimory,
  cataloguePreview,
  catalogueGallery,
})) {
  assert.ok(chunk?.isDynamicEntry, `${name} must be a dynamic entry`);
  assert.match(chunk.file, /^protected\/.+\.js$/);
}

const publicChunks = new Set();
function visit(key) {
  if (publicChunks.has(key)) return;
  publicChunks.add(key);
  const chunk = manifest[key];
  assert.ok(chunk, `Missing manifest entry: ${key}`);
  assert.ok(
    !chunk.file.startsWith("protected/"),
    `Private chunk eagerly imported: ${key}`,
  );
  for (const imported of chunk.imports ?? []) visit(imported);
}
for (const [key, chunk] of Object.entries(manifest)) {
  if (chunk.isEntry) visit(key);
}
console.log(
  "PASS: Pimory and catalogue UI are absent from the public static import graph",
);

// Test real Nginx routing/auth_request with a local Core fixture. Fixture tokens
// are meaningful only inside this process; no production credentials are used.
const nginxBin = process.env.NGINX_BIN || "nginx";
const nginxVersion = spawnSync(nginxBin, ["-v"], { encoding: "utf8" });
assert.equal(
  nginxVersion.status,
  0,
  "Set NGINX_BIN to an Nginx binary with auth_request support",
);
const temp = await mkdtemp(path.join(tmpdir(), "private-ui-auth-check-"));
await mkdir(path.join(temp, "logs"));
const authRequests = [];
const core = http.createServer((req, res) => {
  authRequests.push({
    method: req.method,
    url: req.url,
    cookie: req.headers.cookie,
  });
  const token = req.headers.cookie;
  const status =
    token === "token=fixture-valid"
      ? 200
      : token === "token=fixture-forbidden"
        ? 403
        : token === "token=fixture-error"
          ? 503
          : 401;
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: status === 200 }));
});
await new Promise((resolve) => core.listen(0, "127.0.0.1", resolve));
const corePort = core.address().port;
const portReservation = http.createServer();
await new Promise((resolve) => portReservation.listen(0, "127.0.0.1", resolve));
const port = portReservation.address().port;
await new Promise((resolve) => portReservation.close(resolve));

let nginx;
let nginxLogs = "";
try {
  let config = await readFile(path.join(root, "nginx.conf"), "utf8");
  config = config
    .replace("listen 80;", `listen 127.0.0.1:${port};`)
    .replaceAll("/usr/share/nginx/html", path.join(root, "dist"))
    .replace(
      "https://core.picare.vn/api/v1/users/me",
      `http://127.0.0.1:${corePort}/api/v1/users/me`,
    );
  // Keep the production TLS validation directives; use the host's CA path.
  const caBundle =
    process.env.NGINX_CA_BUNDLE ||
    (process.platform === "darwin"
      ? "/etc/ssl/cert.pem"
      : "/etc/ssl/certs/ca-certificates.crt");
  config = config.replace("/etc/ssl/certs/ca-certificates.crt", caBundle);
  const configPath = path.join(temp, "nginx.conf");
  await writeFile(
    configPath,
    `daemon off;\nmaster_process off;\npid ${temp}/nginx.pid;\nerror_log stderr;\nevents {}\nhttp {\naccess_log off;\n${config}\n}\n`,
  );
  const syntax = spawnSync(nginxBin, ["-t", "-p", temp, "-c", configPath], {
    encoding: "utf8",
  });
  assert.equal(syntax.status, 0, syntax.stderr);
  nginx = spawn(nginxBin, ["-p", temp, "-c", configPath], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  nginx.stderr.on("data", (data) => {
    nginxLogs += data;
  });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      await fetch(`${base}/login`);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert.ok(ready, nginxLogs);
  let checks = 0;
  async function check(uri, expected, headers = {}, noStore = false) {
    const response = await fetch(base + uri, { headers, redirect: "manual" });
    assert.equal(
      response.status,
      expected,
      `${uri}: ${response.status}, expected ${expected}`,
    );
    if (noStore)
      assert.match(response.headers.get("cache-control"), /private, no-store/);
    await response.arrayBuffer();
    checks++;
    return response;
  }
  const spoofed = {
    "User-Agent": "Mozilla/5.0",
    Referer: "https://hub.picare.vn/pimory",
  };
  const valid = { Cookie: "token=fixture-valid" };
  const invalid = { Cookie: "token=made-up" };
  await check("/login", 200);
  await check("/", 200);
  const redirect = await check("/pimory", 302, {}, true);
  assert.match(
    redirect.headers.get("location"),
    /\/login\?redirect=%2Fpimory$/,
  );
  await check("/pimory", 302, invalid, true);
  await check("/pimory", 200, valid, true);
  await check("/pimory/", 308);
  const asset = `/${pimory.file}`;
  await check(asset, 401, {}, true);
  await check(asset, 401, spoofed, true);
  await check(asset + "?download=1", 401, spoofed, true);
  await check(asset, 401, invalid, true);
  await check(asset, 403, { Cookie: "token=fixture-forbidden" }, true);
  await check(asset, 503, { Cookie: "token=fixture-error" }, true);
  await check(asset, 200, valid, true);
  // An authenticated response must never grant access to the next anonymous request.
  await check(asset, 401, {}, true);
  await check("/protected/missing.js", 401, {}, true);
  await check("/protected/missing.js", 404, valid, true);
  await check("/_private_ui_auth", 404);
  await check("/protected/../" + pimory.file, 401, spoofed, true);
  const catalogueId = "43b04bae-410d-48c9-89e3-7897c5e5ea94";
  for (const target of [catalogueId, "gallery"]) {
    const uri = `/catalogue/public/${target}`;
    const expectedRedirect = `/login?redirect=%2Fcatalogue%2Fpublic%2F${target}`;
    for (const requestUri of [uri, uri + "/", uri + "?test=1"]) {
      const redirect = await check(requestUri, 302, spoofed, true);
      assert.ok(redirect.headers.get("location").endsWith(expectedRedirect));
    }
    await check(uri, 302, invalid, true);
    await check(uri, 200, valid, true);
    await check(uri, 503, { Cookie: "token=fixture-error" }, true);
  }
  for (const chunk of [cataloguePreview, catalogueGallery]) {
    const uri = "/" + chunk.file;
    await check(uri, 401, {}, true);
    await check(uri, 401, spoofed, true);
    await check(uri, 401, invalid, true);
    await check(uri, 200, valid, true);
    await check(uri, 401, {}, true);
  }
  assert.ok(authRequests.length > 0);
  assert.ok(
    authRequests.every(
      (req) => req.method === "GET" && req.url === "/api/v1/users/me",
    ),
  );
  console.log(
    `PASS: ${checks} Nginx HTTP checks (anonymous, spoofed headers, invalid/valid session, fail-closed, cache isolation)`,
  );
} finally {
  if (nginx && nginx.exitCode === null) {
    const exited = once(nginx, "exit");
    nginx.kill("SIGTERM");
    await exited;
  }
  await new Promise((resolve) => core.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
