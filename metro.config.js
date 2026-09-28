const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname);

config.watchFolders = [...config.watchFolders, path.resolve(workspaceRoot, "packages/core")];
config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.emptyModulePath = require.resolve(
  "metro-runtime/src/modules/empty-module.js",
  { paths: [workspaceRoot] },
);

module.exports = withNativeWind(config, { input: "./global.css" });
