import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Grid from 'antd/es/grid';
import PageTransition from '@/components/common/PageTransition';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileDrawer from './MobileDrawer';
import styles from './AppLayout.module.css';

const { useBreakpoint } = Grid;

export default function AppLayout() {
  const screens = useBreakpoint();
  const isMobile = !screens?.lg;
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
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </div>
    </div>
  );
}
