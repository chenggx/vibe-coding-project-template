import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconSelector from '../components/IconSelector';
import { AVAILABLE_ICONS, iconMap } from '../iconConfig';

describe('IconSelector', () => {
  it('应该渲染 placeholder', () => {
    render(<IconSelector />);
    expect(screen.getByText('请选择图标')).toBeInTheDocument();
  });

  it('点击后应该展示图标列表', async () => {
    const user = userEvent.setup();
    render(<IconSelector />);
    const select = screen.getByRole('combobox');
    await user.click(select);
    expect(screen.getByRole('option', { name: /Dashboard/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Setting/ })).toBeInTheDocument();
  });

  it('选中图标后应该触发 onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<IconSelector onChange={onChange} />);
    const select = screen.getByRole('combobox');
    await user.click(select);
    const option = screen.getByRole('option', { name: /Setting/ });
    await user.click(option);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe('Setting');
  });

  it('iconMap 应该包含所有可用图标', () => {
    for (const icon of AVAILABLE_ICONS) {
      expect(iconMap[icon.name]).toBeDefined();
    }
  });
});
