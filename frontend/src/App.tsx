import { ConfigProvider, App as AntApp, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect, useMemo } from 'react';
import AppRoutes from '@/app/routes';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { syncSystemTheme } from '@/modules/theme/slice';

function App() {
  const dispatch = useAppDispatch();
  const resolvedMode = useAppSelector((state) => state.theme.resolvedMode);
  const isDark = resolvedMode === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedMode);
  }, [resolvedMode]);

  useEffect(() => {
    const listener = () => {
      dispatch(syncSystemTheme());
    };
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [dispatch]);

  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#0d9488',
        colorPrimaryHover: '#0f766e',
        colorBgLayout: isDark ? '#0f172a' : '#f8fafc',
        colorBgContainer: isDark ? '#1e293b' : '#ffffff',
        colorText: isDark ? '#e2e8f0' : '#1e293b',
        colorTextSecondary: isDark ? '#94a3b8' : '#64748b',
        colorBorder: isDark ? '#334155' : '#e2e8f0',
        borderRadius: 8,
        borderRadiusSM: 6,
        borderRadiusLG: 8,
        fontFamily: "Outfit, 'PingFang SC', 'Microsoft YaHei', sans-serif",
        boxShadow: isDark
          ? '0 1px 3px 0 rgb(0 0 0 / 0.3)'
          : '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        boxShadowSecondary: isDark
          ? '0 4px 6px -1px rgb(0 0 0 / 0.3)'
          : '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      },
      components: {
        Card: {
          borderRadius: 8,
          boxShadow: isDark
            ? '0 1px 3px 0 rgb(0 0 0 / 0.3)'
            : '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        },
        Button: { borderRadius: 6 },
        Modal: { borderRadius: 8 },
        Table: {
          borderRadius: 8,
          headerBg: isDark ? '#1e293b' : '#f8fafc',
        },
        Input: {
          borderRadius: 6,
          activeShadow: `0 0 0 2px ${isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(13, 148, 136, 0.2)'}`,
        },
        Select: {
          borderRadius: 6,
        },
        Pagination: {
          borderRadius: 6,
        },
      },
    }),
    [isDark],
  );

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntApp>
        <AppRoutes />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
