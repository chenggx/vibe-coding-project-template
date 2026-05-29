import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';

const routeCrumbs: Record<string, string> = {
  '/': '首页',
  '/dashboard': '仪表盘',
  '/users': '用户管理',
  '/roles': '角色管理',
  '/menus': '菜单管理',
  '/profile': '个人中心',
};

export default function BreadcrumbNav() {
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ path: '/', title: routeCrumbs['/'] }];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    if (routeCrumbs[currentPath]) {
      crumbs.push({ path: currentPath, title: routeCrumbs[currentPath] });
    }
  }

  if (crumbs.length <= 1) {
    return null;
  }

  const items = crumbs.map((crumb, index) => {
    const isLast = index === crumbs.length - 1;
    return {
      title: isLast ? crumb.title : <Link to={crumb.path}>{crumb.title}</Link>,
    };
  });

  return <Breadcrumb items={items} />;
}
