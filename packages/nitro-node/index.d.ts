import type { NitroModulesProxy as NativeNitroModulesProxy } from "nitro-core";

export type { HybridObject } from "nitro-core";

export declare const NitroModulesProxy: NativeNitroModulesProxy;

declare global {
  var NitroModulesProxy: NativeNitroModulesProxy | undefined;
}

/** Load a native addon into this environment's JSI runtime. */
export declare function loadAddon(filename: string | URL): {
  install(runtimeHandle: unknown): void;
};
