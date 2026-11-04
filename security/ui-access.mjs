import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

export function routeScope(path) {
  if (/^\/qr-products\/(?:generator\/?$|[^/]+\/edit\/?$)/.test(path))
    return "qr-products";
  if (/^\/catalogue\/(?:create\/?$|[^/]+\/edit\/?$)/.test(path))
    return "catalogue";
  if (
    /^\/dashboard(?:\/|$)/.test(path) ||
    /^\/contracts\/(?:create\/?$|[^/]+\/(?:edit|preview)\/?$)/.test(path)
  )
    return "dashboard";
  if (
    /^\/pimory\/?$/.test(path) ||
    /^\/catalogue\/public\/[A-Za-z0-9-]+\/?$/.test(path)
  )
    return "member";
  return null;
}

export function createUiAccess({
  policy,
  coreOrigin = "https://core.picare.vn",
  fetchImpl = fetch,
  log = (event) => console.log(JSON.stringify(event)),
  now = Date.now,
  assetLimit = 180,
  secret = randomBytes(32),
}) {
  const pending = new Map(),
    counters = new Map();
  const emit = (event) =>
    log({
      at: new Date(now()).toISOString(),
      buildId: policy.buildId,
      ...event,
    });
  const bucket = (key, limit) => {
    const time = now(),
      current = counters.get(key);
    if (!current || time >= current.until) {
      if (counters.size >= 10000) {
        for (const [id, value] of counters)
          if (time >= value.until) counters.delete(id);
        if (counters.size >= 10000) return false;
      }
      counters.set(key, { count: 1, until: time + 60000 });
      return true;
    }
    return ++current.count <= limit;
  };
  async function identity(cookie) {
    const token = /(?:^|;\s*)token=([^;]+)/.exec(cookie || "")?.[1];
    if (!token || token.length > 4096 || /[\r\n]/.test(token))
      return { status: 401 };
    const hash = createHash("sha256").update(token).digest("hex");
    if (pending.has(hash)) return pending.get(hash);
    if (pending.size >= 256) return { status: 503 };
    const task = (async () => {
      try {
        const response = await fetchImpl(
          new URL("/api/v1/users/me", coreOrigin),
          {
            headers: { Cookie: `token=${token}`, Accept: "application/json" },
            redirect: "error",
            signal: AbortSignal.timeout(8000),
          },
        );
        if ([401, 403].includes(response.status))
          return { status: response.status };
        if (!response.ok) return { status: 503 };
        const body = await response.json(),
          user = body.data;
        if (
          !body.success ||
          typeof user?.userId !== "string" ||
          !user.userId ||
          user.userId.length > 128 ||
          typeof user.role !== "string" ||
          user.status !== "ACTIVE"
        )
          return { status: 403 };
        const auditId = createHmac("sha256", secret)
          .update(`${user.userId}\0${hash}`)
          .digest("hex")
          .slice(0, 16);
        return { status: 200, userId: user.userId, role: user.role, auditId };
      } catch {
        return { status: 503 };
      }
    })();
    pending.set(hash, task);
    try {
      return await task;
    } finally {
      pending.delete(hash);
    }
  }
  return createServer({ maxHeaderSize: 16384 }, async (req, res) => {
    const requestId = randomUUID();
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Request-Id", requestId);
    const send = (status, body) => {
      if (status === 429) res.setHeader("Retry-After", "60");
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(body ? JSON.stringify(body) : undefined);
    };
    try {
      const uri = new URL(req.url, "http://internal");
      if (uri.pathname === "/health" && req.method === "GET")
        return send(200, { ready: true });
      const isAuthorize = uri.pathname === "/authorize" && req.method === "GET";
      const isSession = uri.pathname === "/session" && req.method === "GET";
      const isEvent = uri.pathname === "/event" && req.method === "POST";
      if (!isAuthorize && !isSession && !isEvent) return send(404);
      const subject = await identity(req.headers.cookie);
      let path = isAuthorize
        ? req.headers["x-original-uri"]
        : uri.searchParams.get("path");
      const originalTarget = path;
      if (isEvent) {
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 2048) return send(413);
          chunks.push(chunk);
        }
        try {
          path = JSON.parse(Buffer.concat(chunks).toString("utf8")).path;
        } catch {
          return send(400);
        }
      }
      if (isAuthorize && typeof path === "string") {
        try {
          path = decodeURIComponent(new URL(path, "http://internal").pathname);
        } catch {
          return send(400);
        }
      }
      if (
        typeof path !== "string" ||
        path.length > 512 ||
        /[?#\r\n]/.test(path)
      )
        return send(400);
      // Manifest allowlist prevents a guessed filename from selecting its own role.
      const scope = path.startsWith("/protected/")
        ? policy.files[path]
        : routeScope(path);
      let status = subject.status;
      if (
        status === 200 &&
        (!scope ||
          (scope !== "member" &&
            !(
              policy.scopeRoles?.[scope] ??
              (scope === "dashboard" ? policy.dashboardRoles : [])
            ).includes(subject.role)))
      )
        status = 403;
      if (
        status === 200 &&
        !bucket(
          `${isAuthorize ? "asset" : "event"}:${subject.userId}`,
          isAuthorize ? assetLimit : 120,
        )
      )
        status = 429;
      const event = {
        event: isAuthorize
          ? "ui.delivery"
          : isEvent
            ? "ui.navigation.client_reported"
            : "ui.session",
        requestId,
        path,
        status,
        ...(subject.userId
          ? {
              userId: subject.userId,
              role: subject.role,
              auditId: subject.auditId,
            }
          : {}),
      };
      // Never log cookies, tokens, query strings, names, emails or request bodies.
      emit(event);
      if (status !== 200) {
        if (
          isAuthorize &&
          status === 401 &&
          scope &&
          typeof originalTarget === "string" &&
          originalTarget.startsWith("/")
        ) {
          res.setHeader(
            "X-Ui-Login",
            `/login?redirect=${encodeURIComponent(originalTarget)}`,
          );
        }
        if (isAuthorize && status === 429) {
          res.setHeader("X-Ui-Limited", "1");
          return send(403);
        }
        return send(status, { success: false, requestId });
      }
      res.setHeader("X-Ui-Actor", subject.userId);
      res.setHeader("X-Ui-Audit", subject.auditId);
      return send(
        isAuthorize ? 204 : 200,
        isAuthorize
          ? null
          : {
              success: true,
              data: { auditId: subject.auditId, buildId: policy.buildId },
            },
      );
    } catch {
      return send(500, { success: false, requestId });
    }
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const policy = JSON.parse(
    await readFile(process.env.UI_POLICY_FILE || "/app/ui-policy.json", "utf8"),
  );
  const limit = Number(process.env.UI_ASSET_LIMIT_PER_MINUTE || 180);
  if (!Number.isInteger(limit) || limit < 60 || limit > 10000)
    throw new Error("Invalid UI asset rate limit");
  const server = createUiAccess({ policy, assetLimit: limit });
  server.requestTimeout = 15000;
  server.listen(Number(process.env.PORT || 8080), "0.0.0.0");
  process.on("SIGTERM", () => server.close(() => process.exit(0)));
}
