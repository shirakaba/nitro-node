import assert from "node:assert/strict";
import process from "node:process";
import { test } from "node:test";
import { init, loadAddon } from "nitro-node";

test("importing the library does not load native code or install globals", async (t) => {
  const dlopen = t.mock.method(process, "dlopen", () => {
    throw new Error("Native code must not load during import");
  });
  await import("../index.js?import-only");
  assert.equal(dlopen.mock.callCount(), 0);
  assert.equal(Object.hasOwn(globalThis, "NitroModulesProxy"), false);
});

test("loading an addon requires explicit initialization", () => {
  assert.throws(
    () => loadAddon(new URL("./missing.node", import.meta.url)),
    /Call init\(\) before loading native addons/,
  );
});

test("a failed initialization can be retried", (t) => {
  t.mock.method(process, "dlopen", () => {
    throw new Error("Simulated native load failure");
  });
  assert.throws(() => init(), /Simulated native load failure/);
  assert.equal(Object.hasOwn(globalThis, "NitroModulesProxy"), false);
});

test("init installs Nitro and returns the populated proxy without example bindings", () => {
  const NitroModulesProxy = init();
  assert.ok(NitroModulesProxy);
  assert.equal(globalThis.NitroModulesProxy, NitroModulesProxy);
  assert.equal(typeof loadAddon, "function");
  assert.deepEqual(NitroModulesProxy.getAllHybridClassNames().sort(), [
    "HybridObject",
    "NitroModulesProxy",
  ]);
});

test("init is idempotent and preserves the proxy identity", (t) => {
  const proxy = init();
  const dlopen = t.mock.method(process, "dlopen", () => {
    throw new Error("Repeated initialization must not reload native code");
  });
  assert.equal(init(), proxy);
  assert.equal(init(), proxy);
  assert.equal(globalThis.NitroModulesProxy, proxy);
  assert.equal(dlopen.mock.callCount(), 0);
});

test("package and direct imports share the runtime", async () => {
  const direct = await import("../index.js");
  const packaged = await import("nitro-node");
  assert.equal(direct, packaged);
  assert.equal(direct.init(), init());
});

test("the addon loader reports missing native addons", () => {
  assert.throws(() => loadAddon(new URL("./missing.node", import.meta.url)), {
    code: "ERR_DLOPEN_FAILED",
  });
});
