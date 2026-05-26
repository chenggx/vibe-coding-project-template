import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userApi } from '../api';
import api from '@/services/api';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getUsers with params', async () => {
    const params = { name: 'test', page: 1, per_page: 15 };
    vi.mocked(api.get).mockResolvedValue({ data: [], meta: null });

    await userApi.getUsers(params);

    expect(api.get).toHaveBeenCalledWith('/users', { params });
  });

  it('should call getUser with id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: null });

    await userApi.getUser(1);

    expect(api.get).toHaveBeenCalledWith('/users/1');
  });

  it('should call createUser with data', async () => {
    const data = {
      name: 'test',
      email: 'test@example.com',
      password: '123456',
    };
    vi.mocked(api.post).mockResolvedValue({ data: null });

    await userApi.createUser(data);

    expect(api.post).toHaveBeenCalledWith('/users', data);
  });

  it('should call updateUser with id and data', async () => {
    const data = { name: 'updated' };
    vi.mocked(api.put).mockResolvedValue({ data: null });

    await userApi.updateUser(1, data);

    expect(api.put).toHaveBeenCalledWith('/users/1', data);
  });

  it('should call deleteUser with id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: null });

    await userApi.deleteUser(1);

    expect(api.delete).toHaveBeenCalledWith('/users/1');
  });
});
