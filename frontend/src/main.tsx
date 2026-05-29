import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { store } from '@/store';
import App from './App';
import '@/styles/global.css';
import '@/styles/antd.override.css';
import '@/styles/responsive.css';

dayjs.locale('zh-cn');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
