// Conditional Metro configuration: default Expo config in development for clearer source maps,
// Sentry-enhanced config only in production (where we upload source maps / artifacts).
const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const isProd = process.env.NODE_ENV === 'production';

function withSvgSupport(config) {
	const transformer = config.transformer ?? {};
	config.transformer = {
		...transformer,
		babelTransformerPath: require.resolve('react-native-svg-transformer'),
	};

	const resolver = config.resolver ?? { assetExts: [], sourceExts: [] };
	const assetExts = Array.isArray(resolver.assetExts)
		? resolver.assetExts.filter((ext) => ext !== 'svg')
		: [];
	const sourceExts = Array.isArray(resolver.sourceExts) ? resolver.sourceExts : [];
	config.resolver = {
		...resolver,
		assetExts,
		sourceExts: sourceExts.includes('svg') ? sourceExts : [...sourceExts, 'svg'],
	};

	return config;
}

if (isProd) {
	module.exports = withSvgSupport(getSentryExpoConfig(__dirname));
} else {
	const config = withSvgSupport(getDefaultConfig(__dirname));
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
