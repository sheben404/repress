import fastGlob from 'fast-glob';
import { normalizePath } from 'vite';
import path from 'path';

interface RouteMeta {
  routePath: string;
  absolutePath: string;
}

export class RouteService {
  _scanDir: string;
  _routeData: RouteMeta[] = [];

  constructor(scanDir: string) {
    this._scanDir = scanDir;
  }

  async init() {
    const files = fastGlob
      .sync(['**/*.{js,jsx,ts,tsx,md,mdx}'], {
        cwd: this._scanDir,
        absolute: true,
        ignore: ['**/node_modules/**', '**/build/**', 'config.ts']
      })
      .sort();
    console.log(files);

    files.forEach((file) => {
      const fileRelativePath = normalizePath(
        path.relative(this._scanDir, file)
      );
      // 1. 路由路径
      const routePath = this.normalizeRoutePath(fileRelativePath);
      // 2. 文件绝对路径
      this._routeData.push({
        routePath,
        absolutePath: file
      });
    });
  }

  // 获取路由数据，方便测试
  getRouteMeta(): RouteMeta[] {
    return this._routeData;
  }

  normalizeRoutePath(rawPath: string) {
    const routePath = rawPath.replace(/\.(.*)?$/, '').replace(/index$/, '');
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }

  generateRoutesCode(ssr = false) {
    return `
  import React from 'react';
  ${ssr ? '' : 'import loadable from "@loadable/component";'}
  ${this._routeData
    .map((route, index) => {
      return ssr
        ? `import Route${index} from "${route.absolutePath}";`
        : `const Route${index} = loadable(() => import('${route.absolutePath}'));`;
    })
    .join('\n')}
  export const routes = [
  ${this._routeData
    .map((route, index) => {
      return `{ path: '${route.routePath}', element: React.createElement(Route${index}) }`;
    })
    .join(',\n')}
  ];
  `;
  }
}
