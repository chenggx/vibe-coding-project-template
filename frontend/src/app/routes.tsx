import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppSelector } from '@/hooks';
import { useGetCurrentUserQuery } from '@/services/adminApi';

// Lazy loaded pages
const LoginPage = React.lazy(
  () => import('@/modules/auth/pages/LoginPage'),
);
const DashboardPage = React.lazy(
  () => import('@/modules/dashboard/pages/DashboardPage'),
);
const UserListPage = React.lazy(
  () => import('@/modules/user/pages/UserListPage'),
);
const RoleListPage = React.lazy(
  () => import('@/modules/role/pages/RoleListPage'),
);
const MenuListPage = React.lazy(
  () => import('@/modules/menu/pages/MenuListPage'),
);
const ProfilePage = React.lazy(
  () => import('@/modules/auth/pages/ProfilePage'),
);

class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          页面加载失败，请刷新重试
        </div>
      );
    }
    return this.props.children;
  }
}

function LazyLoader({ children }: { children: React.ReactNode }) {
  return (
    <RouteErrorBoundary>
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <Spin size="large" />
          </div>
        }
      >
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
}

// Route permission mapping
const routePermissionMap: Record<string, string> = {
  '/users': 'users.index',
  '/roles': 'roles.index',
  '/menus': 'menus.all',
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, permissions, user } = useAppSelector(
    (state) => state.auth,
  );
  const token = useAppSelector((state) => state.auth.token);
  const { isLoading: isFetchingUser } = useGetCurrentUserQuery(undefined, {
    skip: !token || !!user,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isFetchingUser && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, isFetchingUser, navigate, location]);

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check route permission
  const requiredPermission = routePermissionMap[location.pathname];
  if (
    requiredPermission &&
    user?.id !== 1 &&
    !permissions.includes(requiredPermission)
  ) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        无权访问
      </div>
    );
  }

  return <>{children}</>;
}

// Wrapper to use AppLayout
import AppLayout from '@/components/layout/AppLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LazyLoader>
            <LoginPage />
          </LazyLoader>
        }
      />
      <Route
        path="/"
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <LazyLoader>
              <DashboardPage />
            </LazyLoader>
          }
        />
        <Route
          path="users"
          element={
            <LazyLoader>
              <UserListPage />
            </LazyLoader>
          }
        />
        <Route
          path="roles"
          element={
            <LazyLoader>
              <RoleListPage />
            </LazyLoader>
          }
        />
        <Route
          path="menus"
          element={
            <LazyLoader>
              <MenuListPage />
            </LazyLoader>
          }
        />
        <Route
          path="profile"
          element={
            <LazyLoader>
              <ProfilePage />
            </LazyLoader>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
