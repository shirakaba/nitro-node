import process from "node:process";
import { fileURLToPath } from "node:url";

const nativeModule = { exports: {} };
process.dlopen(nativeModule, fileURLToPath(new URL("./build/nitro_node.node", import.meta.url)));

export const { jsiHello, NitroModulesProxy } = nativeModule.exports;
