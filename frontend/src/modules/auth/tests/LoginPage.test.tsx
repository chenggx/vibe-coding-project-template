import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../pages/LoginPage';
import authReducer from '../slice';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

function createTestStore() {
  return configureStore({
    reducer: { auth: authReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

function renderWithProviders(
  ui: React.ReactElement,
  store = createTestStore(),
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>,
    ),
  };
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染标题、输入框和登录按钮', () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: '欢迎回来' }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('邮箱')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /登/ }),
    ).toBeInTheDocument();
  });

  it('应该允许用户输入邮箱和密码', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('邮箱');
    const passwordInput = screen.getByPlaceholderText('密码');

    await user.type(emailInput, 'admin@test.com');
    await user.type(passwordInput, '123456');

    expect(emailInput).toHaveValue('admin@test.com');
    expect(passwordInput).toHaveValue('123456');
  });

  it('空表单提交应该显示验证错误', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /登/ });
    await user.click(submitButton);

    expect(
      await screen.findByText('请输入邮箱地址'),
    ).toBeInTheDocument();
  });
});
