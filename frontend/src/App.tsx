import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppRoutes from '@/app/routes';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
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
