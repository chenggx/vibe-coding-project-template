import { useAppSelector } from '@/hooks/useAppSelector';

export function usePermission() {
  const { permissions, user } = useAppSelector((state) => state.auth);

  const hasPermission = (permission: string): boolean => {
    if (user?.is_super_admin) return true;
    return permissions.includes(permission);
  };

  return { hasPermission, permissions };
}
