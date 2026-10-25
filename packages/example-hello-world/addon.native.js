import { TurboModuleRegistry } from "react-native";

/** @type {import("./addon.js").HelloWorldBindings | undefined} */
let bindings;

/** Install the shared C++ module into React Native's Hermes runtime. */
export function init() {
  if (!bindings) {
    TurboModuleRegistry.getEnforcing("ExampleHelloWorld");
    const { NitroModulesProxy, jsiHello } = globalThis;
    if (!NitroModulesProxy || typeof jsiHello !== "function") {
      throw new Error("ExampleHelloWorld did not install its JSI bindings");
    }
    bindings = {
      jsiHello,
      HelloWorld: NitroModulesProxy.getHybridClass("HelloWorld"),
    };
  }
  return bindings;
}
