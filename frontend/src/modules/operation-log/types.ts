export interface OperationLog {
  id: number;
  user_id: number | null;
  username: string | null;
  method: string;
  path: string;
  action: string;
  ip: string | null;
  created_at: string;
}

export interface FetchOperationLogsParams {
  page?: number;
  per_page?: number;
  username?: string;
  action?: string;
  method?: string;
  path?: string;
}

export const OPERATION_LOG_TYPE_MARKER = 'operation-log' as const;
