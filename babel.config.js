module.exports = function (api) {
  api.cache(true);
  // Do not use api.env() here — it conflicts with Metro's Babel cache
  // ("Caching has already been configured with .never or .forever()").
  const isProd =
    process.env.BABEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const plugins = [];
  if (isProd) {
    plugins.push('transform-remove-console');
  }
  // Must be last.
  plugins.push('react-native-reanimated/plugin');
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
