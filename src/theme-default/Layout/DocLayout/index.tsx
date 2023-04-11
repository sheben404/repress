import { Content, usePageData } from '@runtime';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar/index';
import { DocFooter } from '../../components/DocFooter/index';
import { Aside } from '../../components/Aside/index';
import styles from './index.module.scss';

export function DocLayout() {
  const { siteData, toc } = usePageData();
  const sidebarData = siteData.themeConfig?.sidebar || {};
  const { pathname } = useLocation();
  const matchedSidebarKey = Object.keys(sidebarData).find((key) => {
    if (pathname.startsWith(key)) {
      return true;
    }
  });

  const matchedSidebar = sidebarData[matchedSidebarKey] || [];

  return (
    <div>
      <Sidebar sidebarData={matchedSidebar} pathname={pathname} />
      <div className={styles.content} flex="~">
        <div className={styles.docContent}>
          <div className="repress-doc">
            <Content />
          </div>
          <DocFooter />
        </div>
        <div className={styles.asideContainer}>
          <Aside headers={toc} __repress />
        </div>
      </div>
    </div>
  );
}
