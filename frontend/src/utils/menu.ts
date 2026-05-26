import type { MenuTree } from '@/types/menu';

export function extractPermissions(menus: MenuTree[]): string[] {
  const permissions: string[] = [];
  function traverse(nodes: MenuTree[]) {
    for (const node of nodes) {
      if (node.permission) {
        permissions.push(node.permission);
      }
      if (node.children?.length) {
        traverse(node.children);
      }
    }
  }
  traverse(menus);
  return permissions;
}

export function flattenMenuTree(menus: MenuTree[]): MenuTree[] {
  const result: MenuTree[] = [];
  function traverse(nodes: MenuTree[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) {
        traverse(node.children);
      }
    }
  }
  traverse(menus);
  return result;
}
