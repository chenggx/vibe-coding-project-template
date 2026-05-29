export interface LoginLog {
  id: number;
  user_id: number | null;
  email: string;
  name: string | null;
  type: 'login' | 'failed';
  ip: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  message: string | null;
  created_at: string;
}

export interface FetchLoginLogsParams {
  page?: number;
  per_page?: number;
  email?: string;
  name?: string;
  type?: 'login' | 'failed';
  browser?: string;
  os?: string;
  ip?: string;
  created_from?: string;
  created_to?: string;
}

export const LOGIN_LOG_TYPE_MARKER = 'login-log' as const;
