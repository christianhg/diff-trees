import { FlatNode, FlatTree } from './flatten-tree';
import { TreeNode } from './types';

export function expandTree<TValue>([
  root,
  nodes,
]: FlatTree<TValue>): TreeNode<TValue> {
  return {
    id: root.id,
    value: root.value,
    children: expandNodes(Array.from(nodes), root.id),
  };
}

function expandNodes<TValue>(
  flatNodes: FlatNode<TValue>[],
  parentId: string
): TreeNode<TValue>[] {
  const children = flatNodes
    .filter(([, { address }]) => address[0] === parentId)
    .sort(([, nodeA], [, nodeB]) => nodeA.address[1] - nodeB.address[1]);
  const rest = flatNodes.filter(
    ([_, node]) => !children.find(([_, child]) => node.id === child.id)
  );

  return children.map(([_, child]) => ({
    id: child.id,
    value: child.value,
    children: expandNodes(rest, child.id),
  }));
}
