import { init as initNitro, loadAddon } from "nitro-node";

/** @type {import("./addon.js").HelloWorldBindings | undefined} */
let bindings;

/** Initialize the module once and return its native bindings. */
export function init() {
  if (!bindings) {
    const NitroModulesProxy = initNitro();
    loadAddon(new URL("./build/Release/hello_world.node", import.meta.url));
    const jsiHello = globalThis.jsiHello;
    if (typeof jsiHello !== "function") {
      throw new Error("The HelloWorld addon did not install jsiHello");
    }
    bindings = {
      jsiHello,
      HelloWorld: NitroModulesProxy.getHybridClass("HelloWorld"),
    };
  }
  return bindings;
}
