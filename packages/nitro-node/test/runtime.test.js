import assert from "node:assert/strict";
import { test } from "node:test";
import { loadAddon, NitroModulesProxy } from "nitro-node";

test("the library installs Nitro without any example bindings", () => {
  assert.equal(globalThis.NitroModulesProxy, NitroModulesProxy);
  assert.equal(typeof loadAddon, "function");
  assert.deepEqual(NitroModulesProxy.getAllHybridClassNames().sort(), [
    "HybridObject",
    "NitroModulesProxy",
  ]);
});

test("package and direct imports share the runtime", async () => {
  const direct = await import("../index.js");
  const packaged = await import("nitro-node");
  assert.equal(direct, packaged);
  assert.equal(direct.NitroModulesProxy, NitroModulesProxy);
});

test("the addon loader reports missing native addons", () => {
  assert.throws(() => loadAddon(new URL("./missing.node", import.meta.url)), {
    code: "ERR_DLOPEN_FAILED",
  });
});
