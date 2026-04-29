module.exports = function (api) {
  api.cache(true);

  const isWeb = process.env.EXPO_PLATFORM === 'web';

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // babel-preset-expo@54 internally loads react-native-reanimated/plugin
          // which requires react-native-worklets — crashes on web.
          // Passing reanimated: false tells the preset to skip it on web.
          reanimated: !isWeb,
        },
      ],
    ],
    // NOTE: Do NOT add 'nativewind/babel' here.
    // In NativeWind v4, it exports a preset-shaped object (with a .plugins key),
    // not a plain plugin function. Babel rejects it in the plugins[] array.
    // The jsxImportSource: 'nativewind' option above is the correct integration point.
    plugins: [],
  };
};
