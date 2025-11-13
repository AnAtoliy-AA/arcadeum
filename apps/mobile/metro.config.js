// Metro configuration tweaks: ensure SVG support for all builds and
// keep dev defaults aligned with the Expo workflow.
const { getDefaultConfig } = require('expo/metro-config');

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

const config = withSvgSupport(getDefaultConfig(__dirname));

if (process.env.NODE_ENV !== 'production') {
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

	config.server = {
		...config.server,
		enhanceMiddleware: (mw) => (req, res, next) => {
			res.setHeader('Cache-Control', 'no-store');
			return mw(req, res, next);
		},
	};
}

module.exports = config;
