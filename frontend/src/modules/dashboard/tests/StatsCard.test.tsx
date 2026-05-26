import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserOutlined } from '@ant-design/icons';
import StatsCard from '../components/StatsCard';

describe('StatsCard', () => {
  it('应该正确渲染 title 和 value', () => {
    render(
      <StatsCard
        title="用户总数"
        value={42}
        icon={<UserOutlined />}
        color="#c45c3e"
      />,
    );
    expect(screen.getByText('用户总数')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('应该渲染 suffix', () => {
    render(
      <StatsCard
        title="增长率"
        value="12"
        icon={<UserOutlined />}
        color="#c45c3e"
        suffix="%"
      />,
    );
    expect(screen.getByText('%')).toBeInTheDocument();
  });
});
