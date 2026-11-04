import { createHash } from "node:crypto";
import JavaScriptObfuscator from "javascript-obfuscator";
import type { Plugin } from "vite";

type Scope =
  | "member"
  | "dashboard"
  | "qr-products"
  | "catalogue"
  | "admin"
  | "overview"
  | "contracts-dashboard";
const normalized = (id: string) => id.split("?")[0].replace(/\\/g, "/");
function rootScope(id: string): Scope | null {
  const file = normalized(id);
  if (/\/src\/pages\/authenticated\/.*\.tsx$/.test(file)) return "member";
  if (/\/src\/components\/(?:ModalContainer|DrawerContainer)\.tsx$/.test(file))
    return "admin";
  if (
    /\/src\/pages\/private\/(?:AccountDashboard|HubClient(?:Create|Dashboard|Edit)|Storage(?:Dashboard|FolderDetail)|License(?:Create|Edit|Detail|List|Support)|SystemSettingDashboard)Page\.tsx$/.test(
      file,
    )
  )
    return "admin";
  if (
    /\/src\/pages\/private\/Contract(?:Dashboard|DetailDashboard)Page\.tsx$/.test(
      file,
    )
  )
    return "contracts-dashboard";
  if (
    /\/src\/(?:routes\/PrivateRoutes|pages\/private\/(?:SettingDashboardPage|PrivateStubPage))\.tsx$/.test(
      file,
    )
  )
    return "dashboard";
  if (
    /\/src\/pages\/private\/QRProduct(?:Generator|Edit|Dashboard)Page\.tsx$/.test(
      file,
    )
  )
    return "qr-products";
  if (/\/src\/pages\/private\/Catalogue(?:Create|Edit)Page\.tsx$/.test(file))
    return "catalogue";
  if (
    /\/src\/pages\/private\/(?:[^/]+\.tsx|.*Page\.tsx)$/.test(file) ||
    /\/src\/routes\/Private(?:Contract)?Routes\.tsx$/.test(file)
  )
    return "overview";
  return null;
}

export function privateUiBuild(
  dashboardRoles: readonly string[],
  toolRoles: Record<
    "qr-products" | "catalogue" | "admin" | "overview" | "contracts-dashboard",
    readonly string[]
  >,
  dashboardRoutes: readonly { pattern: string; scope: string }[],
) {
  const scopeRoles: Record<string, readonly string[]> = {
    dashboard: dashboardRoles,
    ...toolRoles,
  };
  const publicIds = new Set<string>();
  const scopes = new Map<string, Set<Scope>>();
  const scopeOf = (id: string): string | null => {
    if (publicIds.has(id)) return null;
    const allowed = scopes.get(id);
    if (!allowed?.size) return null;
    // Anything required by authenticated member screens remains member-shared.
    if (allowed.has("member")) return "member";
    const key = [...allowed].sort().join("+");
    scopeRoles[key] = [
      ...new Set([...allowed].flatMap((scope) => scopeRoles[scope])),
    ].sort();
    return key;
  };
  return {
    // Keep dependencies shared by tools and dashboard in separate chunks so
    // allowing a tool never exposes an entire dashboard page bundled with them.
    sharedChunk(id: string) {
      const scope = scopeOf(id);
      return scope?.includes("+")
        ? `shared-${scope.replaceAll("+", "-")}`
        : undefined;
    },
    chunkFileNames(chunk: { moduleIds: string[] }) {
      const groups = new Set(chunk.moduleIds.map(scopeOf).filter(Boolean));
      if (groups.size > 1)
        throw new Error(
          "Private UI scopes merged; split the chunk before publishing",
        );
      return groups.size
        ? `protected/${[...groups][0]}/[name]-[hash].js`
        : "assets/[name]-[hash].js";
    },
    plugin: {
      name: "picare-private-ui-boundary",
      apply: "build",
      buildEnd(error) {
        if (error) return;
        publicIds.clear();
        scopes.clear();
        const walk = (id: string, seen: Set<string>) => {
          if (seen.has(id)) return;
          seen.add(id);
          for (const dependency of this.getModuleInfo(id)?.importedIds ?? [])
            walk(dependency, seen);
        };
        for (const id of this.getModuleIds()) {
          if (this.getModuleInfo(id)?.isEntry) walk(id, publicIds);
        }
        for (const id of this.getModuleIds()) {
          const scope = rootScope(id);
          if (!scope) continue;
          if (publicIds.has(id))
            this.error(`Private UI eagerly imported by public entry: ${id}`);
          const dependencies = new Set<string>();
          walk(id, dependencies);
          for (const dependency of dependencies) {
            const values = scopes.get(dependency) ?? new Set<Scope>();
            values.add(scope);
            scopes.set(dependency, values);
          }
        }
      },
      generateBundle(_options, bundle) {
        const files: Record<string, string> = {};
        for (const asset of Object.values(bundle)) {
          if (asset.type !== "chunk") continue;
          for (const id of Object.keys(asset.modules)) {
            const scope = scopeOf(id);
            if (scope && !asset.fileName.startsWith(`protected/${scope}/`)) {
              this.error(`Private UI leaked into ${asset.fileName}: ${id}`);
            }
          }
          if (
            !asset.fileName.startsWith("protected/") &&
            asset.imports.some((name) => name.startsWith("protected/"))
          ) {
            this.error(
              `Public chunk eagerly imports private UI: ${asset.fileName}`,
            );
          }
          if (asset.fileName.startsWith("protected/")) {
            const grants = new Set(
              Object.keys(asset.modules).map(scopeOf).filter(Boolean),
            );
            if (grants.size !== 1)
              this.error(`Ambiguous private chunk grant: ${asset.fileName}`);
            const scope = [...grants][0]!;
            files["/" + asset.fileName] = scope;
          }
        }
        const buildId = createHash("sha256")
          .update(Object.keys(bundle).sort().join("\n"))
          .digest("hex")
          .slice(0, 16);
        this.emitFile({
          type: "asset",
          fileName: ".security/ui-policy.json",
          source: JSON.stringify({
            buildId,
            dashboardRoles,
            scopeRoles,
            dashboardRoutes,
            files,
          }),
        });
      },
    } satisfies Plugin,
  };
}

// Transform final chunks, including dynamic imports. Reserved build placeholders
// and asset paths preserve Rollup hashes and Vite's module preload references.
export function obfuscateBuild(): Plugin {
  return {
    name: "picare-global-bundle-obfuscation",
    apply: "build",
    enforce: "post",
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith(".js")) return null;
      const result = JavaScriptObfuscator.obfuscate(code, {
        target: "browser",
        seed: 20261103,
        compact: true,
        ignoreImports: true,
        renameGlobals: false,
        selfDefending: false,
        debugProtection: false,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        stringArray: true,
        stringArrayEncoding: ["base64"],
        stringArrayThreshold: 0.65,
        splitStrings: false,
        transformObjectKeys: false,
        numbersToExpressions: false,
        reservedStrings: [".*!~\\{.*", ".*__VITE.*", ".*\\.(js|css)(\\?.*)?$"],
      });
      return { code: result.getObfuscatedCode(), map: null };
    },
  };
}
