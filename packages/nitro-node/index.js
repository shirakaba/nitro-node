import process from "node:process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const nativeModule = { exports: {} };
process.dlopen(
  nativeModule,
  fileURLToPath(new URL("./build/Release/nitro_node.node", import.meta.url)),
);

export const { NitroModulesProxy } = nativeModule.exports;

const addons = new Map();

/** Load a native addon built with nitro_node_add_addon into this environment's runtime. */
export function loadAddon(filename) {
  const path = filename instanceof URL ? fileURLToPath(filename) : resolve(filename);
  if (addons.has(path)) return addons.get(path);

  const addon = { exports: {} };
  process.dlopen(addon, path);
  addon.exports.install(nativeModule.exports.runtimeHandle);
  addons.set(path, addon.exports);
  return addon.exports;
}
