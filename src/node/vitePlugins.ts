import pluginReact from '@vitejs/plugin-react';
import { pluginIndexHtml } from './plugin-repress/indexHtml';
import { pluginConfig } from './plugin-repress/config';
import { pluginRoutes } from './plugin-routes';
import { SiteConfig } from 'shared/types';
import { createPluginMdx } from './plugin-mdx';
import pluginUnocss from 'unocss/vite';
import unocssOptions from './unocssOptions';

export async function createVitePlugins(
  config: SiteConfig,
  restartServer?: () => Promise<void>,
  isSSR = false
) {
  return [
    pluginUnocss(unocssOptions),
    pluginIndexHtml(),
    pluginConfig(config, restartServer),
    pluginRoutes({
      root: config.root,
      isSSR
    }),
    pluginReact({
      jsxRuntime: 'automatic'
    }),
    await createPluginMdx()
  ];
}
