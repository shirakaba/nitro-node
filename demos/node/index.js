import { init } from "example-hello-world";

const { jsiHello, HelloWorld } = init();
console.log(jsiHello("macOS"));
const hello = new HelloWorld();
console.log(hello.greet("macOS"));
console.log(hello.toString());
