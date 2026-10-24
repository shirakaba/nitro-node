# Vendored node-api-jsi

Source: <https://github.com/microsoft/node-api-jsi>

Pinned commit: `4b8a4a59c4e1b7b988b809dedffd89a7662aa785` (downloaded 2026-10-26).

Included: `src/NodeApiJsiRuntime.{h,cpp}`, the NodeApi and JSRuntimeApi loaders, their `.inc` function lists, the POSIX loader, `node-api/*.h`, and both applicable MIT license files. The upstream Windows tests, engine-specific loaders, and bundled old JSI copy are omitted. This addon uses the installed React Native 0.88 JSI headers and implementation consistently throughout the build.

Local source change: `src/ApiLoaders/NodeApi_posix.cpp` implements upstream's two TODOs using `dlopen` and `dlsym`. A null library name opens the current process so the adapter can resolve Node's exported Node-API symbols. Like upstream's Windows loader, the process handle remains open for the process lifetime.

`NodeApiJsiRuntime.cpp` and the other vendored source files are otherwise unchanged. The addon's CMake project supplies `JSI_VERSION=21` to select the adapter's newest implemented branches, plus `NAPI_VERSION=8` as the addon registration version. The upstream runtime source itself enables `NAPI_EXPERIMENTAL`; the adapter is delay loaded, and the tested paths resolve successfully on the Node versions listed in the root README. Treat the observed cross-version results as tested compatibility, not a claim that every adapter path uses only stable Node-API v8 functions.
