import { DataContext } from '@runtime';
import { App, initPageData } from './app';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

export interface RenderResult {
  appHtml: string;
  propsData: unknown[];
  repressToPathMap: Record<string, string>;
}

// For ssr component render
export async function render(pagePath: string) {
  const pageData = await initPageData(pagePath);
  const { clearRepressData, data } = await import('./jsx-runtime');
  const { repressProps, repressToPathMap } = data;
  clearRepressData();
  const appHtml = renderToString(
    <DataContext.Provider value={pageData}>
      <StaticRouter location={pagePath}>
        <App />
      </StaticRouter>
    </DataContext.Provider>
  );
  return {
    appHtml,
    repressProps,
    repressToPathMap
  };
}

// 导出路由数据
export { routes } from 'repress:routes';
