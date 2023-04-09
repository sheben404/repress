// app.tsx
import { Layout } from '../theme-default';
import { routes } from 'repress:routes';
import { matchRoutes } from 'react-router-dom';
import { PageData } from 'shared/types';
import siteData from 'repress:site-data';
import { Route } from 'node/plugin-routes';

export async function initPageData(routePath: string): Promise<PageData> {
  // 获取路由组件编译后的模块内容
  const matched = matchRoutes(routes, routePath);

  if (matched) {
    // Preload route component
    const route = matched[0].route as Route;
    const moduleInfo = await route.preload();
    return {
      pageType: moduleInfo.frontmatter?.pageType ?? 'doc',
      siteData,
      frontmatter: moduleInfo.frontmatter,
      pagePath: routePath,
      toc: moduleInfo.toc
    };
  }
  return {
    pageType: '404',
    siteData,
    pagePath: routePath,
    frontmatter: {}
  };
}

export function App() {
  return <Layout />;
}
