# Vendored node-api-jsi

Source: <https://github.com/microsoft/node-api-jsi>

Pinned commit: `4b8a4a59c4e1b7b988b809dedffd89a7662aa785` (downloaded 2026-10-26).

Included: `src/NodeApiJsiRuntime.{h,cpp}`, the NodeApi and JSRuntimeApi loaders, their `.inc` function lists, the POSIX loader, Microsoft's `node-api/js_runtime_api.h` extension header, and the Microsoft MIT license. The upstream Windows tests, engine-specific loaders, bundled old JSI copy, and four standard Node-API headers are omitted. This addon uses the installed React Native 0.88 JSI headers and implementation consistently throughout the build.

The standard `node_api.h`, `node_api_types.h`, `js_native_api.h`, and `js_native_api_types.h` headers come from the `node-api-headers` package supplied by cmake-js through `CMAKE_JS_INC`. Microsoft's `js_runtime_api.h` declares the additional `jsr_*` hosting APIs that package does not provide. It includes the standard headers from that same cmake-js include path. The removed Node.js header copies' separate license is no longer needed in this directory; `LICENSE` at the root of this vendored subtree covers the remaining Microsoft code.

Local source change: `src/ApiLoaders/NodeApi_posix.cpp` implements upstream's two TODOs using `dlopen` and `dlsym`. A null library name opens the current process so the adapter can resolve Node's exported Node-API symbols. Like upstream's Windows loader, the process handle remains open for the process lifetime.

`NodeApiJsiRuntime.cpp` and the other vendored source files are otherwise unchanged. The addon's CMake project supplies `JSI_VERSION=21` to select the adapter's newest implemented branches, plus `NAPI_VERSION=8` as the addon registration version. The upstream runtime source itself enables `NAPI_EXPERIMENTAL`; the adapter is delay loaded, and the tested paths resolve successfully on the Node versions listed in the root README. Treat the observed cross-version results as tested compatibility, not a claim that every adapter path uses only stable Node-API v8 functions.
