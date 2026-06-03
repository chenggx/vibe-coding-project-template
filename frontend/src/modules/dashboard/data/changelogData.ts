export interface ChangelogItem {
  version: string;
  date: string;
  changes: string[];
}

const changelogData: ChangelogItem[] = [
  {
    version: 'v1.0.0',
    date: '2026-06-03',
    changes: [
      '初始化项目，搭建前后端分离架构',
      '实现用户管理、角色管理、菜单管理功能',
      '实现登录认证与权限控制',
      '实现公告管理功能',
      '实现操作日志与登录日志',
    ],
  },
];

export default changelogData;
