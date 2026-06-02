import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/tests/utils';
import LoginPage from '../pages/LoginPage';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

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

  it('禁用或过期用户登录应该显示错误提示', async () => {
    server.use(
      http.post('http://localhost:8000/api/login', () => {
        return HttpResponse.json({
          code: 10002,
          message: '账号已禁用或已过期',
          data: null,
        });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('邮箱');
    const passwordInput = screen.getByPlaceholderText('密码');
    const submitButton = screen.getByRole('button', { name: /登/ });

    await user.type(emailInput, 'disabled@example.com');
    await user.type(passwordInput, 'password');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('账号已禁用或已过期')).toBeInTheDocument();
    });
  });
});
