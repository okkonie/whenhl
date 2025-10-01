module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      // Keep the Reanimated plugin last
      "react-native-reanimated/plugin",
    ],
  };
};