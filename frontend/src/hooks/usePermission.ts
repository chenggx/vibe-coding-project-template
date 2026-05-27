import { useCallback } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';

export function usePermission() {
  const { permissions, user } = useAppSelector((state) => state.auth);

  const hasPermission = useCallback((permission: string): boolean => {
    if (user?.id === 1) return true;
    return permissions.includes(permission);
  }, [permissions, user?.id]);

  return { hasPermission, permissions };
}
