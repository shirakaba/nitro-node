import { loadAddon, NitroModulesProxy } from "nitro-node";

loadAddon(new URL("./build/hello_world.node", import.meta.url));

export const jsiHello = globalThis.jsiHello;
export const HelloWorld = NitroModulesProxy.getHybridClass("HelloWorld");
