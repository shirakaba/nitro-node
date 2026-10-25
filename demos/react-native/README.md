# Nitro v1 in Expo Desktop

This app keeps Expo SDK 55, React Native iOS 0.83.10, and React Native macOS 0.83.0. It uses Hermes **260318099.0.4** and JSI sources from **React Native 0.88.0**, matching the installed Nitro v1 nightly. `App.tsx` calls the `jsiHello` host function and constructs the same C++ `HelloWorld` HybridObject as the Node demo.

## Native setup

Install workspace dependencies first with `pnpm install`. The root pnpm patch declarations install the following changes:

- RN and RNM: copy the RN 0.88 JSI headers and support sources, pin the opt-in Hermes V1 version, and use that VM's bundled bytecode compiler. The normal RN/RNM version stays 0.83.
- Nitro core: add a CocoaPods spec for its unchanged C++ and Apple C++ sources. The nightly's standard RN adapter uses RN 0.88's SwiftPM integration, so this proof of concept installs the C++ core through RN 0.83's existing `RCTTurboModuleWithJSIBindings` hook.
- Expo CLI 55: backport SDK 58's Simulator/DeviceHub fallback for Xcode 27.

The `with-hermes-88.cjs` config plugin selects Hermes V1 and disables precompiled RN core and Expo modules, so every JSI consumer is rebuilt against the matching interface. Hermes remains prebuilt. Its `hermes-ios` tarball includes a universal macOS framework as well as the iOS XCFramework; a separate `hermes-macos` download is unnecessary. The included `hermesc` compiler must stay paired with the VM.

Generate native projects from the app directory:

```sh
pnpm exec expo-desktop prebuild --platform ios --no-install --skip-dependency-update react-native,react
pnpm exec expo-desktop prebuild --platform macos --no-install --skip-dependency-update react-native,react
```

For an existing native project, update the engine pod so CocoaPods reevaluates its changed podspec:

```sh
(cd ios && pod update hermes-engine React-jsi --no-repo-update)
(cd macos && pod update hermes-engine React-jsi --no-repo-update)
```

For newly generated projects, `pod install` in each native directory is sufficient. The native directories are ignored; the config plugin and pnpm patches preserve this setup across prebuilds.

## Run

From this directory, use `pnpm ios --device` to select an iOS 26.x simulator, or `pnpm macos`. Both load the same package through its `react-native` conditional export. The screen displays the results of both native calls and Hermes runtime information, also logged with the `[NitroDemo]` prefix.

Verified with Debug builds on an iPhone 17 Pro simulator running iOS 26.5 and on this Apple Silicon Mac, using Xcode 27.1. Both screens report Hermes `260318099.0.4` and show successful JSI and Nitro calls. The 12 installed JSI header/support files in both RN packages match RN 0.88.0 byte for byte. The Node host and example still pass all 18 tests.

iOS 27 rejects SDK 55's older application scene lifecycle before JavaScript runs (`UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`). The CLI patch handles Xcode 27's DeviceHub discovery; adopting the newer iOS scene lifecycle is a separate migration. Use an iOS 26.x simulator for this proof of concept.

This is a C++ module proof of concept, not a full backport of Nitro's newer SwiftPM, Swift bridge, or native view integration. Android and Windows have not been migrated to the newer Hermes/JSI pairing.
