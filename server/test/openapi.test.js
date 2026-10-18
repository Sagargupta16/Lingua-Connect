// docs/openapi.yaml must describe exactly the routes the server mounts.
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const { mounts } = require("../app");

const spec = YAML.parse(
   fs.readFileSync(path.join(__dirname, "../../docs/openapi.yaml"), "utf8"),
);

// Express "/view/:id" is OpenAPI "/view/{id}".
const toOpenApi = (p) => p.replace(/:(\w+)/g, "{$1}");

const codeRoutes = () => {
   const routes = ["get /token-check"];
   for (const [prefix, router] of mounts)
      for (const layer of router.stack)
         if (layer.route)
            for (const method of Object.keys(layer.route.methods))
               routes.push(`${method} ${prefix}${toOpenApi(layer.route.path)}`);
   return routes.sort();
};

const specRoutes = () =>
   Object.entries(spec.paths)
      .flatMap(([p, ops]) => Object.keys(ops).map((m) => `${m} ${p}`))
      .sort();

describe("openapi spec", () => {
   it("documents every route the server mounts, and nothing else", () => {
      assert.deepEqual(specRoutes(), codeRoutes());
   });

   it("matches the package version", () => {
      const { version } = require("../../package.json");
      assert.equal(spec.info.version, version);
   });
});
