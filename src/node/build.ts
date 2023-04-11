import { InlineConfig, build as viteBuild } from 'vite';
import {
  CLIENT_ENTRY_PATH,
  EXTERNALS,
  MASK_SPLITTER,
  PACKAGE_ROOT,
  SERVER_ENTRY_PATH
} from './constants';
import type { RollupOutput } from 'rollup';
import path, { dirname, join } from 'path';
import fs from 'fs-extra';
// import ora from 'ora';
import { SiteConfig } from 'shared/types';
import { createVitePlugins } from './vitePlugins';
import { Route } from './plugin-routes';
import { RenderResult } from 'runtime/ssr-entry';
import { HelmetData } from 'react-helmet-async';

const CLIENT_OUTPUT = 'build';

export async function bundle(root: string, config: SiteConfig) {
  const resolveViteConfig = async (
    isServer: boolean
  ): Promise<InlineConfig> => ({
    mode: 'production',
    root,
    plugins: await createVitePlugins(config, undefined, isServer),
    ssr: {
      // 注意加上这个配置，防止 cjs 产物中 require ESM 的产物，因为 react-router-dom 的产物为 ESM 格式
      noExternal: ['react-router-dom', 'lodash-es']
    },
    build: {
      minify: false,
      ssr: isServer,
      outDir: isServer
        ? path.join(root, '.temp')
        : path.join(root, CLIENT_OUTPUT),
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? 'cjs' : 'esm'
        },
        external: EXTERNALS
      }
    }
  });
  // const spinner = ora();
  // spinner.start('Building client + server bundles...');

  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(await resolveViteConfig(false)),
      // server build
      viteBuild(await resolveViteConfig(true))
    ]);
    const publicDir = join(root, 'public');
    if (fs.pathExistsSync(publicDir)) {
      await fs.copy(publicDir, join(root, CLIENT_OUTPUT));
    }
    await fs.copy(join(PACKAGE_ROOT, 'vendors'), join(root, CLIENT_OUTPUT));
    // spinner.succeed();
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function buildRepress(
  root: string,
  repressPathToMap: Record<string, string>
) {
  // { Aside: 'xxx' }
  // 内容
  // import { Aside } from 'xxx'
  // window.REPRESS = { Aside }
  // window.REPRESS_PROPS = JSON.parse(
  // document.getElementById('repress-props').textContent
  // );
  const repressInjectCode = `
    ${Object.entries(repressPathToMap)
      .map(
        ([repressName, repressPath]) =>
          `import { ${repressName} } from '${repressPath}'`
      )
      .join('')}
window.REPRESS = { ${Object.keys(repressPathToMap).join(', ')} };
window.REPRESS_PROPS = JSON.parse(
  document.getElementById('repress-props').textContent
);
  `;
  const injectId = 'repress:inject';
  return viteBuild({
    mode: 'production',
    esbuild: {
      jsx: 'automatic'
    },
    build: {
      outDir: path.join(root, '.temp'),
      rollupOptions: {
        input: injectId,
        external: EXTERNALS
      }
    },
    plugins: [
      {
        name: 'repress:inject',
        enforce: 'post',
        resolveId(id) {
          if (id.includes(MASK_SPLITTER)) {
            const [originId, importer] = id.split(MASK_SPLITTER);
            return this.resolve(originId, importer, { skipSelf: true });
          }

          if (id === injectId) {
            return id;
          }
        },
        load(id) {
          if (id === injectId) {
            return repressInjectCode;
          }
        },
        // 对于 Repress Bundle，我们只需要 JS 即可，其它资源文件可以删除
        generateBundle(_, bundle) {
          for (const name in bundle) {
            if (bundle[name].type === 'asset') {
              delete bundle[name];
            }
          }
        }
      }
    ]
  });
}

export async function renderPage(
  render: (routePath: string, helmetContext: object) => RenderResult,
  routes: Route[],
  root: string,
  clientBundle: RollupOutput
) {
  console.log('Rendering page in server side...');
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  );
  return Promise.all(
    routes.map(async (route) => {
      const routePath = route.path;
      const helmetContext = {
        context: {}
      } as HelmetData;
      const {
        appHtml,
        repressToPathMap,
        repressProps = []
      } = await render(routePath, helmetContext.context);
      const styleAssets = clientBundle.output.filter(
        (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
      );
      const repressBundle = await buildRepress(root, repressToPathMap);
      const repressCode = (repressBundle as RollupOutput).output[0].code;
      const normalizeVendorFilename = (fileName: string) =>
        fileName.replace(/\//g, '_') + '.js';
      const { helmet } = helmetContext.context;
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    ${helmet?.title?.toString() || ''}
    ${helmet?.meta?.toString() || ''}
    ${helmet?.link?.toString() || ''}
    ${helmet?.style?.toString() || ''}
    <meta name="description" content="xxx">
    ${styleAssets
      .map((item) => `<link rel="stylesheet" href="/${item.fileName}">`)
      .join('\n')}
      <script type="importmap">
      {
        "imports": {
          ${EXTERNALS.map(
            (name) => `"${name}": "/${normalizeVendorFilename(name)}"`
          ).join(',')}
        }
      }
    </script>
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script type="module">${repressCode}</script>
    <script type="module" src="/${clientChunk?.fileName}"></script>
    <script id="repress-props">${JSON.stringify(repressProps)}</script>
  </body>
</html>`.trim();
      const fileName = routePath.endsWith('/')
        ? `${routePath}index.html`
        : `${routePath}.html`;
      await fs.ensureDir(join(root, 'build', dirname(fileName)));
      await fs.writeFile(join(root, 'build', fileName), html);
    })
  );
}

export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1. bundle - client 端 + server 端
  const [clientBundle] = await bundle(root, config);
  // 2. 引入 server-entry 模块
  const serverEntryPath = join(root, '.temp', 'ssr-entry.js');
  const { render, routes } = await import(serverEntryPath);
  // 3. 服务端渲染，产出 HTML
  try {
    await renderPage(render, routes, root, clientBundle);
  } catch (e) {
    console.log('Render page error.\n', e);
  }
}
