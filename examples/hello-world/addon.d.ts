import type { HybridObject } from "nitro-node";

export declare function jsiHello(name: string): string;

export declare class HelloWorld extends HybridObject {
  constructor();
  greet(name: string): string;
}

declare global {
  var jsiHello: typeof import("./addon.js").jsiHello;
}
