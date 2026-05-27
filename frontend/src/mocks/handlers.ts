import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    });
  }),
  http.post('/api/login', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        user: { id: 1, name: 'Admin', email: 'admin@example.com', status: true, expires_at: null, remarks: null, created_at: '2026-05-20', updated_at: '2026-05-20', roles: [{ id: 1, name: 'super-admin', display_name: '超级管理员', description: null, created_at: '2026-05-20', updated_at: '2026-05-20' }] },
        token: '1|test_token',
      },
    });
  }),
];
