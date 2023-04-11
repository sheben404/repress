import pluginReact from '@vitejs/plugin-react';
import { pluginIndexHtml } from './plugin-repress/indexHtml';
import { pluginConfig } from './plugin-repress/config';
import { pluginRoutes } from './plugin-routes';
import { SiteConfig } from 'shared/types';
import { createPluginMdx } from './plugin-mdx';
import pluginUnocss from 'unocss/vite';
import unocssOptions from './unocssOptions';
import path from 'path';
import babelPluginRepress from './babel-plugin-repress';
import { PACKAGE_ROOT } from './constants';

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
      jsxRuntime: 'automatic',
      jsxImportSource: isSSR
        ? path.join(PACKAGE_ROOT, 'src', 'runtime')
        : 'react',
      babel: {
        plugins: [babelPluginRepress]
      }
    }),
    await createPluginMdx()
  ];
}
