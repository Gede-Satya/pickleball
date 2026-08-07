export type OrgNode = {
  id: string;
  name: string;
  position: string;
  order: number;
  parentId: string | null;
  children: OrgNode[];
};

export function buildTree(items: Omit<OrgNode, "children">[]): OrgNode[] {
  const map = new Map<string, OrgNode>();
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));

  const roots: OrgNode[] = [];
  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(item);
    } else {
      roots.push(item);
    }
  });

  const sortByOrder = (nodes: OrgNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((n) => sortByOrder(n.children));
  };
  sortByOrder(roots);

  return roots;
}