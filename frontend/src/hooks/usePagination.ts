import { useState, useCallback } from 'react';
import type { PaginationMeta } from '@/types/api';

interface UsePaginationOptions {
  defaultPageSize?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { defaultPageSize = 15 } = options;
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const onChange = useCallback((page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
  }, []);

  const reset = useCallback(() => {
    setCurrent(1);
    setPageSize(defaultPageSize);
  }, [defaultPageSize]);

  const getPaginationConfig = (meta: PaginationMeta | null) => ({
    current: meta?.current_page ?? current,
    pageSize: meta?.per_page ?? pageSize,
    total: meta?.total ?? 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
    onChange,
  });

  return { current, pageSize, onChange, reset, getPaginationConfig };
}
