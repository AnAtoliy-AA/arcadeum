// Use CommonJS require to avoid ESM subpath resolution issues (Error: Cannot find module '@sentry/react-native/metro')
// This follows Sentry's official React Native + Expo docs.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
