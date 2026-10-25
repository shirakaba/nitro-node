import assert from "node:assert/strict";
import { once } from "node:events";
import { setImmediate } from "node:timers/promises";
import { Worker } from "node:worker_threads";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { init, loadAddon } from "nitro-node";
import { HelloWorld, jsiHello } from "../addon.js";

const NitroModulesProxy = init();

test("JSI installs a callable native function into the actual Node global", () => {
  assert.equal(global.jsiHello, jsiHello);
  assert.equal(jsiHello("macOS"), "Hello, macOS! From JSI on Node.js.");
  // @ts-expect-error Deliberately pass an invalid argument.
  assert.throws(() => jsiHello(42), /jsiHello expects one string argument/);
  // @ts-expect-error Deliberately omit an argument.
  assert.throws(() => jsiHello(), /jsiHello expects one string argument/);
});

test("dynamic and package imports reuse the installed native bindings", async () => {
  const direct = await import("../addon.js");
  const packaged = await import("hello-world");
  assert.equal(direct, packaged);
  assert.equal(direct.jsiHello, jsiHello);
  const host = await import("nitro-node");
  assert.equal(host.init(), NitroModulesProxy);
});

test("loading the example addon again reuses its bindings", () => {
  const url = new URL("../build/Release/hello_world.node", import.meta.url);
  assert.equal(loadAddon(url), loadAddon(fileURLToPath(url)));
  assert.equal(globalThis.jsiHello, jsiHello);
});

test("Nitro installs its real proxy and registers a constructible HybridClass", () => {
  assert.equal(global.NitroModulesProxy, NitroModulesProxy);
  assert.equal(NitroModulesProxy.hasHybridClass("HelloWorld"), true);
  assert.ok(NitroModulesProxy.getAllHybridClassNames().includes("HelloWorld"));
  assert.equal(NitroModulesProxy.getHybridClass("HelloWorld"), HelloWorld);
  const hello = new HelloWorld();
  assert.equal(hello.greet("Node.js"), "Hello, Node.js! From Nitro v1 on Node.js.");
  assert.equal(hello.toString(), "[HybridObject HelloWorld]");
  assert.ok(hello instanceof HelloWorld);
  assert.equal(NitroModulesProxy.hasNativeState(hello), true);
  assert.equal(hello.equals(hello), true);
  assert.equal(hello.equals(new HelloWorld()), false);
});

test("strings cross Node-API, JSI, and Nitro with Unicode and embedded NULs", () => {
  const hello = new HelloWorld();
  for (const name of ["", "世界 🌏", "a\0b", "é e\u0301"]) {
    assert.equal(jsiHello(name), `Hello, ${name}! From JSI on Node.js.`);
    assert.equal(hello.greet(name), `Hello, ${name}! From Nitro v1 on Node.js.`);
  }
});

test("Nitro errors propagate back to JavaScript and subsequent calls work", () => {
  const hello = new HelloWorld();
  // @ts-expect-error Deliberately pass an invalid argument.
  assert.throws(() => hello.greet(42));
  // @ts-expect-error Deliberately omit an argument.
  assert.throws(() => hello.greet());
  assert.throws(() => NitroModulesProxy.getHybridClass("MissingClass"), /not registered/);
  assert.equal(hello.greet("again"), "Hello, again! From Nitro v1 on Node.js.");
});

test("Nitro dispose removes native state and rejects further method calls", () => {
  const hello = new HelloWorld();
  hello.dispose();
  assert.equal(NitroModulesProxy.hasNativeState(hello), false);
  assert.throws(() => hello.greet("disposed"));
});

test("bindings survive addon initialization, event loop turns, and garbage collection", async () => {
  assert.ok(global.gc, "Run the tests with --expose-gc");
  const hello = new HelloWorld();
  for (let turn = 0; turn < 3; turn++) {
    for (let i = 0; i < 500; i++) new HelloWorld().greet("temporary");
    global.gc();
    await setImmediate();
    assert.equal(jsiHello("later"), "Hello, later! From JSI on Node.js.");
    assert.equal(hello.greet("later"), "Hello, later! From Nitro v1 on Node.js.");
  }
});

test("Workers get independent runtimes and exit cleanly", async () => {
  const addonURL = new URL("../addon.js", import.meta.url).href;
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      const worker = new Worker(new URL("./fixtures/hello-worker.js", import.meta.url), {
        workerData: addonURL,
      });
      const exit = once(worker, "exit");
      const [message] = await once(worker, "message");
      assert.deepEqual(message, [
        "Hello, Worker! From JSI on Node.js.",
        "Hello, Worker! From Nitro v1 on Node.js.",
      ]);
      const [code] = await exit;
      assert.equal(code, 0);
    }),
  );
  assert.equal(jsiHello("main"), "Hello, main! From JSI on Node.js.");
});
