import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-repress/indexHtml';
import pluginReact from '@vitejs/plugin-react';

export async function createDevServer(root = process.cwd()) {
  return createViteDevServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact()]
  });
}
