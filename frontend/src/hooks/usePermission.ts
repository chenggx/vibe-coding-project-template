import { useCallback } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';

export function usePermission() {
  const { permissions, user } = useAppSelector((state) => state.auth);

  const hasPermission = useCallback((permission: string): boolean => {
    // TODO: 等待后端 CurrentUserResponse 包含 is_super_admin 字段后改为 user?.is_super_admin === true
    if (user?.id === 1) return true;
    return permissions.includes(permission);
  }, [permissions, user?.id]);

  return { hasPermission, permissions };
}
