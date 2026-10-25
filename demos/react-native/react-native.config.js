module.exports = {
  dependencies: {
    // This proof of concept hosts nitro-core directly. The nightly RN adapter
    // uses RN 0.88's SwiftPM integration, which RN/RNM 0.83 do not have.
    "react-native-nitro-modules": { platforms: { ios: null, macos: null } },
  },
};
