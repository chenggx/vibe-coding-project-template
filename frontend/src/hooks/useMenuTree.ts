import { useMemo } from 'react';
import type { MenuTree } from '@/types/menu';

export function useMenuTree(menus: MenuTree[]) {
  const flatMenus = useMemo(() => {
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
  }, [menus]);

  const menuMap = useMemo(() => {
    const map = new Map<number, MenuTree>();
    for (const menu of flatMenus) {
      map.set(menu.id, menu);
    }
    return map;
  }, [flatMenus]);

  const getParentChain = (menuId: number): MenuTree[] => {
    const chain: MenuTree[] = [];
    let current = menuMap.get(menuId);
    while (current?.parent_id) {
      const parent = menuMap.get(current.parent_id);
      if (parent) {
        chain.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return chain;
  };

  return { flatMenus, menuMap, getParentChain };
}
