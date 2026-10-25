import { init, loadAddon } from "nitro-node";

const NitroModulesProxy = init();
loadAddon(new URL("./build/Release/hello_world.node", import.meta.url));

export const jsiHello = globalThis.jsiHello;
export const HelloWorld = NitroModulesProxy.getHybridClass("HelloWorld");
