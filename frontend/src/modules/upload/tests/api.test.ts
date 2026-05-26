import { describe, it, expect, vi } from 'vitest';
import api from '@/services/api';
import { uploadApi } from '../api';

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('uploadApi', () => {
  it('uploadFile 应该发送 FormData 并返回 url', async () => {
    const mockResponse = { url: 'http://localhost:8000/storage/avatars/test.jpg' };
    vi.mocked(api.post).mockResolvedValue(mockResponse as never);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadApi.uploadFile(file);

    expect(api.post).toHaveBeenCalledWith(
      '/upload',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    expect(result).toEqual(mockResponse);
  });
});
