import { jsiHello, NitroModulesProxy } from "../index.js";

console.log(jsiHello("macOS"));
const HelloWorld = NitroModulesProxy.getHybridClass("HelloWorld");
const hello = new HelloWorld();
console.log(hello.greet("macOS"));
console.log(hello.toString());
