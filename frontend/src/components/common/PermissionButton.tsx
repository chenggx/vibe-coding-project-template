import { Button, type ButtonProps } from 'antd';
import { usePermission } from '@/hooks/usePermission';

interface PermissionButtonProps extends ButtonProps {
  permission: string;
  fallback?: React.ReactNode;
}

export default function PermissionButton({
  permission,
  fallback = null,
  children,
  ...props
}: PermissionButtonProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <Button {...props}>{children}</Button>;
}
