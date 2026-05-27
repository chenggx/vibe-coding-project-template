import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect } from 'react';
import AppRoutes from '@/app/routes';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { syncSystemTheme } from '@/modules/theme/slice';

function App() {
  const dispatch = useAppDispatch();
  const resolvedMode = useAppSelector((state) => state.theme.resolvedMode);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      resolvedMode,
    );
  }, [resolvedMode]);

  useEffect(() => {
    const listener = () => {
      dispatch(syncSystemTheme());
    };
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [dispatch]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm:
          resolvedMode === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#c45c3e',
          borderRadius: 2,
          fontFamily:
            "'Outfit', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        },
        components: {
          Card: { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
          Button: { borderRadius: 2 },
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}

export default App;
