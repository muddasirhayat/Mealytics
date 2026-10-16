module.exports = function (api) {
  api.cache(true);
  const plugins = [];
  if (api.env('production')) {
    plugins.push('transform-remove-console');
  }
  // Must be last.
  plugins.push('react-native-reanimated/plugin');
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
