import { usePermission } from '@/hooks/usePermission';

interface PermissionWrapperProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionWrapper({
  permission,
  children,
  fallback = null,
}: PermissionWrapperProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
