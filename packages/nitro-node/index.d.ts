import type { NitroModulesProxy as NativeNitroModulesProxy } from "nitro-core";

export type { HybridObject, NitroModulesProxy } from "nitro-core";

/** Initialize this environment's JSI runtime once and return its Nitro proxy. */
export declare function init(): NativeNitroModulesProxy;

declare global {
  var NitroModulesProxy: NativeNitroModulesProxy | undefined;
}

/** Load a native addon into this environment's JSI runtime after calling init(). */
export declare function loadAddon(filename: string | URL): {
  install(runtimeHandle: unknown): void;
};
