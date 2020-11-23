import { FlatNodes, FlatTree } from './flatten-tree';
import { TreeNode } from './types';

export function expandTree<TValue>([
  root,
  nodes,
]: FlatTree<TValue>): TreeNode<TValue> {
  return {
    id: root.id,
    value: root.value,
    children: expandNodes(nodes, root.id),
  };
}

function expandNodes<TValue>(
  flatNodes: FlatNodes<TValue>,
  parentId: string
): TreeNode<TValue>[] {
  const children = flatNodes
    .filter(node => node.address[0] === parentId)
    .sort((a, b) => a.address[1] - b.address[1]);
  const rest = flatNodes.filter(
    node => !children.find(child => node.id === child.id)
  );

  return children.map(child => ({
    id: child.id,
    value: child.value,
    children: expandNodes(rest, child.id),
  }));
}
