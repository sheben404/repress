import { DataContext } from '@runtime';
import { App, initPageData } from './app';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

// For ssr component render
export async function render(pagePath: string) {
  const pageData = await initPageData(pagePath);
  return renderToString(
    <DataContext.Provider value={pageData}>
      <StaticRouter location={pagePath}>
        <App />
      </StaticRouter>
    </DataContext.Provider>
  );
}

// 导出路由数据
export { routes } from 'repress:routes';
