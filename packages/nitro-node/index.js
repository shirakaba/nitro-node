import process from "node:process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

let nativeModule;
const addons = new Map();

/** Initialize this environment's JSI runtime once and return its Nitro proxy. */
export function init() {
  if (!nativeModule) {
    const module = { exports: {} };
    process.dlopen(
      module,
      fileURLToPath(new URL("./build/Release/nitro_node.node", import.meta.url)),
    );
    nativeModule = module;
  }
  return nativeModule.exports.NitroModulesProxy;
}

/** Load a native addon built with nitro_node_add_addon into this environment's runtime. */
export function loadAddon(filename) {
  if (!nativeModule) {
    throw new Error("Call init() before loading native addons.");
  }
  const path = filename instanceof URL ? fileURLToPath(filename) : resolve(filename);
  if (addons.has(path)) return addons.get(path);

  const addon = { exports: {} };
  process.dlopen(addon, path);
  addon.exports.install(nativeModule.exports.runtimeHandle);
  addons.set(path, addon.exports);
  return addon.exports;
}
