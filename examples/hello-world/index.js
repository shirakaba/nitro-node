import { jsiHello, HelloWorld } from "./addon.js";

console.log(jsiHello("macOS"));
const hello = new HelloWorld();
console.log(hello.greet("macOS"));
console.log(hello.toString());
