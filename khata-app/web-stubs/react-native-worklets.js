/**
 * Web stub for react-native-worklets.
 * This package is native-only (iOS/Android Hermes engine).
 * Metro aliases this file on web so the bundler doesn't crash
 * when react-native-reanimated tries to import it.
 */
export function executeOnUIRuntimeSync() {}
export function executeOnUIRuntime() {}
export function runOnUI() { return () => {}; }
export function runOnJS() { return () => {}; }
export function makeShareable() { return null; }
export function makeRemote() { return {}; }
export function startMapper() {}
export function stopMapper() {}
export function getViewProp() { return Promise.resolve(); }
export const WorkletsModule = {};
export default {};
