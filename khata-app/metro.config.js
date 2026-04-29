const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Explicitly support CSS for web
config.resolver.sourceExts.push('css');

// expo-sqlite's web backend uses WebAssembly (.wasm).
// Metro doesn't handle .wasm by default — add it to assetExts
// so the wa-sqlite.wasm binary gets treated as a static asset.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// react-native-reanimated v4 imports react-native-worklets at runtime.
// That package is native-only (Hermes JSI). On web, we alias it to an
// empty stub so Metro can resolve and bundle it without crashing.
const workletsStub = path.resolve(__dirname, 'web-stubs/react-native-worklets.js');

const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-worklets') {
    return { filePath: workletsStub, type: 'sourceFile' };
  }
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
