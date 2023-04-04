import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-repress/indexHtml';
import pluginReact from '@vitejs/plugin-react';
import { PACKAGE_ROOT } from './constants';
import { resolveConfig } from './config';

export async function createDevServer(root = process.cwd()) {
  const config = await resolveConfig(root, 'serve', 'development');
  console.log(config);
  return createViteDevServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact()],
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
