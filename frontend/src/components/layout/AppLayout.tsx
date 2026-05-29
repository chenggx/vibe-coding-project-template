import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useResponsive } from '@/hooks';
import PageTransition from '@/components/common/PageTransition';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileDrawer from './MobileDrawer';
import BreadcrumbNav from './BreadcrumbNav';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const { isMobile } = useResponsive();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {!isMobile && <Sidebar collapsed={collapsed} />}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div className={styles.main}>
        <Header
          isMobile={!!isMobile}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <div className={styles.breadcrumbWrapper}>
              <BreadcrumbNav />
            </div>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </div>
    </div>
  );
}
