# Hello World demo on Node.js

This workspace consumes `example-hello-world`. It contains the application entry point and its JavaScript type-checking configuration; the native implementation and module tests live in [`packages/example-hello-world`](../../packages/example-hello-world).

From the repository root:

```sh
pnpm build
pnpm --filter demo-hello-world start
pnpm --filter demo-hello-world typecheck
```

`index.js` imports the module's `init()` function, calls it explicitly, and uses the returned `HelloWorld` constructor and `jsiHello` function.
