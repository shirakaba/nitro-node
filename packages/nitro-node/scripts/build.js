import { existsSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const nitroPackage = fileURLToPath(import.meta.resolve("react-native-nitro-modules/package.json"));
const nitroDir = dirname(nitroPackage);
// pnpm installs React Native beside Nitro as its peer dependency.
const reactNativeDir = realpathSync(resolve(nitroDir, "../react-native"));
const candidates = [
  process.env.NODE_INCLUDE_DIR,
  resolve(dirname(process.execPath), "../include/node"),
  "/opt/homebrew/include/node",
  "/usr/local/include/node",
].filter(Boolean);
const nodeIncludeDir = candidates.find((candidate) => existsSync(join(candidate, "node_api.h")));
if (!nodeIncludeDir) {
  throw new Error(
    "Node-API headers not found. Set NODE_INCLUDE_DIR to a directory containing node_api.h.",
  );
}

function run(args) {
  const result = spawnSync("cmake", args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const buildDir = join(packageDir, "build");
run([
  "-S",
  packageDir,
  "-B",
  buildDir,
  `-DCMAKE_BUILD_TYPE=${process.env.BUILD_TYPE ?? "Release"}`,
  `-DNODE_INCLUDE_DIR=${nodeIncludeDir}`,
  `-DJSI_DIR=${join(reactNativeDir, "ReactCommon/jsi")}`,
  `-DNITRO_DIR=${nitroDir}`,
]);
run(["--build", buildDir, "--parallel"]);
