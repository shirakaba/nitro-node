import type { HybridObject } from "nitro-core";

declare class HelloWorld extends HybridObject {
  constructor();
  greet(name: string): string;
}

export type { HelloWorld };

export interface HelloWorldBindings {
  readonly HelloWorld: typeof HelloWorld;
  readonly jsiHello: (name: string) => string;
}

/** Initialize the module once and return its native bindings. */
export declare function init(): HelloWorldBindings;

declare global {
  var jsiHello: HelloWorldBindings["jsiHello"] | undefined;
}
