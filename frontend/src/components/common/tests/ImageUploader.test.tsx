import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ImageUploader from '../ImageUploader';
import rootReducer from '@/app/rootReducer';

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('ImageUploader', () => {
  it('无图片时应显示上传按钮', () => {
    const onChange = () => {};
    renderWithStore(<ImageUploader onChange={onChange} />);
    expect(screen.getByText('上传头像')).toBeInTheDocument();
  });

  it('有图片时应显示预览和删除按钮', () => {
    const onChange = () => {};
    renderWithStore(
      <ImageUploader
        value="http://example.com/avatar.jpg"
        onChange={onChange}
      />
    );
    expect(screen.getByText('删除')).toBeInTheDocument();
  });
});
