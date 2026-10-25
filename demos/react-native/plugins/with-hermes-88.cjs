const { withPodfile } = require("expo/config-plugins");
const { withPodfile: withMacosPodfile } = require("expo-desktop-config-plugins");

const marker = "hermes-88";
const settings = `# @generated begin ${marker}
# RN/RNM stay on 0.83; their pnpm patches supply RN 0.88's JSI and Hermes.
# Every JSI consumer must compile against that interface, including Expo.
ENV['RCT_HERMES_V1_ENABLED'] = '1'
ENV['RCT_USE_PREBUILT_RNCORE'] = '0'
ENV['EXPO_USE_PRECOMPILED_MODULES'] = '0'
# @generated end ${marker}
`;

function updatePodfile(config) {
  const contents = config.modResults.contents
    .replace(/# @generated begin hermes-88\n[\s\S]*?# @generated end hermes-88\n\n?/, "")
    .replace(/  # @generated begin nitro-core\n[\s\S]*?  # @generated end nitro-core\n/, "");
  const withCore = contents.replace(
    /(target '[^']+' do\n)/,
    `$1  # @generated begin nitro-core\n  # Compile the unchanged Nitro C++ core with the app's JSI.\n  pod 'NitroCore', :path => File.dirname(Pod::Executable.execute_command('node', ['-p', 'require.resolve("nitro-core/package.json")']).strip)\n  # @generated end nitro-core\n`,
  );
  config.modResults.contents = `${settings}\n${withCore}`;
  return config;
}

module.exports = function withHermes88(config) {
  config = withPodfile(config, updatePodfile);
  return withMacosPodfile(config, updatePodfile);
};
