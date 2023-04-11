import { createRoot, hydrateRoot } from 'react-dom/client';
import { App, initPageData } from './app';
import { BrowserRouter } from 'react-router-dom';
import { DataContext } from './hooks';
import { ComponentType } from 'react';
import { HelmetProvider } from 'react-helmet-async';

declare global {
  interface Window {
    REPRESS: Record<string, ComponentType<unknown>>;
    REPRESS_PROPS: unknown[];
  }
}

async function renderInBrowser() {
  const containerEl = document.getElementById('root');
  if (!containerEl) {
    throw new Error('#root element not found');
  }
  if (import.meta.env.DEV) {
    // 初始化 PageData
    const pageData = await initPageData(location.pathname);
    createRoot(containerEl).render(
      <HelmetProvider>
        <DataContext.Provider value={pageData}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DataContext.Provider>
      </HelmetProvider>
    );
  } else {
    // 生产环境下的 Partial Hydration
    const repress = document.querySelectorAll('[__repress]');
    if (repress.length === 0) {
      return;
    }
    for (const repressItem of repress) {
      // Aside:0
      const [id, index] = repressItem.getAttribute('__repress').split(':');
      const Element = window.REPRESS[id] as ComponentType<unknown>;
      hydrateRoot(repressItem, <Element {...window.REPRESS_PROPS[index]} />);
    }
  }
}

renderInBrowser();
