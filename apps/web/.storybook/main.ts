import type { StorybookConfig } from '@storybook/nextjs';

type WebpackConfig = Parameters<
  NonNullable<StorybookConfig['webpackFinal']>
>[0];
type AppRule = NonNullable<
  NonNullable<WebpackConfig['module']>['rules']
>[number];
type AppRuleObject = Extract<AppRule, object>;

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      builder: {
        useSWC: false,
      },
    },
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Replace broken next-swc-loader-patch with babel-loader
    if (config.module?.rules) {
      config.module.rules = config.module.rules.map((rule) => {
        if (typeof rule === 'object' && rule !== null) {
          const ruleSetRule = rule as AppRuleObject;
          if ('use' in ruleSetRule) {
            const use = ruleSetRule.use;
            if (use && typeof use === 'object' && !Array.isArray(use)) {
              if (
                'loader' in use &&
                typeof use.loader === 'string' &&
                use.loader.includes('next-swc-loader-patch.js')
              ) {
                return {
                  ...ruleSetRule,
                  use: {
                    loader: require.resolve('babel-loader'),
                    options: {
                      presets: ['next/babel'],
                    },
                  },
                };
              }
            }
          }
        }
        return rule;
      });
    }
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // 'next/config': require.resolve('./next-config-mock.js'),
      };
    }
    return config;
  },
};
export default config;
