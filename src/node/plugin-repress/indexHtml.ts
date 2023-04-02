import { readFile } from 'fs/promises'
import { Plugin } from 'vite'
import { CLIENT_ENTRY_PATH, DEFAULT_HTML_PATH } from '../constants'

export function pluginIndexHtml(): Plugin {
  return {
    name: 'repress:index-html',
    apply: 'serve',
    // 插入入口 script 标签，不必再在 template.html 中手动添加
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              // @fs 指绝对路径，这是 vite 的约定
              src: `/@fs/${CLIENT_ENTRY_PATH}`,
            },
            injectTo: 'body',
          },
        ],
      }
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          let html = await readFile(DEFAULT_HTML_PATH, 'utf-8')
          try {
            // q：server.transformIndexHtml 的作用是什么？
            // a：这是 vite 的 API，用于在 html head 标签中插入一些 script 标签，实现热更新的效果
            // html = await server.transformIndexHtml(req.url, html, req.originalUrl)
            // 只使用 server.transformIndexHtml 配置热更新会导致每次热更新都是全量刷新，不是局部刷新；
            // 因此还需要配置 src/node/dev.ts 中 pluginReact vite 官方插件来实现局部刷新
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
          } catch (e) {
            return next(e)
          }
        })
      }
    },
  }
}
