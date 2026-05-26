import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageUploader from '../ImageUploader';

describe('ImageUploader', () => {
  it('无图片时应显示上传按钮', () => {
    const onChange = () => {};
    render(<ImageUploader onChange={onChange} />);
    expect(screen.getByText('上传头像')).toBeInTheDocument();
  });

  it('有图片时应显示预览和删除按钮', () => {
    const onChange = () => {};
    render(
      <ImageUploader
        value="http://example.com/avatar.jpg"
        onChange={onChange}
      />
    );
    expect(screen.getByText('删除')).toBeInTheDocument();
  });
});
