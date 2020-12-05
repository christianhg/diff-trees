import { FlatTree, FlatTreeNode, TreeNode } from './types';

export function expandTree<TValues>([
  root,
  nodes,
]: FlatTree<TValues>): TreeNode<TValues> {
  return {
    ...root,
    children: expandNodes(Array.from(nodes), root.id),
  } as TreeNode<TValues>;
}

function expandNodes<TValues>(
  flatNodes: [string, FlatTreeNode<TValues>][],
  parentId: string
): TreeNode<TValues>[] {
  const children = flatNodes
    .filter(([, { address }]) => address[0] === parentId)
    .sort(([, nodeA], [, nodeB]) => nodeA.address[1] - nodeB.address[1]);
  const remainingNodes = flatNodes.filter(
    ([_, node]) => !children.find(([_, child]) => node.id === child.id)
  );

  return children.map(([_, child]) => {
    const { address, ...rest } = child;
    const expandedNode = {
      ...rest,
      children: expandNodes(remainingNodes, rest.id),
    } as TreeNode<TValues>;

    return expandedNode;
  });
}
