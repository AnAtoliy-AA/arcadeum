// Conditional Metro configuration: default Expo config in development for clearer source maps,
// Sentry-enhanced config only in production (where we upload source maps / artifacts).
const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
	module.exports = getSentryExpoConfig(__dirname);
} else {
	const config = getDefaultConfig(__dirname);
	// Improve web debugging: keep module names and disable inline requires for clearer stack & sources
	config.transformer = {
		...config.transformer,
		unstable_disableModuleWrapping: false,
		unstable_disableOptimisticBundle: false,
		inlineRequires: false,
		minifierPath: config.transformer?.minifierPath,
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: false,
			},
		}),
	};
    
	// No extra server overrides needed; rely on Expo defaults for dev.
	config.server = {
		...config.server,
		enhanceMiddleware: (mw) => (req, res, next) => {
			res.setHeader('Cache-Control', 'no-store');
			return mw(req, res, next);
		},
	};

	module.exports = config;
}
