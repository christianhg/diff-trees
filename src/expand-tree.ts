import { Entry } from './entries';
import { Address, TreeNode } from './types';

type ExpandedTree<TValue> = Pick<TreeNode<TValue>, 'id'> & {
  children: ExpandedTree<TValue>[];
};

type FlatTreeNode<TValue> = Pick<TreeNode<TValue>, 'id'> & {
  address: Address<TValue>;
};

type FlatTree<TValue> = [
  Pick<TreeNode<TValue>, 'id'>,
  Map<TreeNode<TValue>['id'], FlatTreeNode<TValue>>
];

export function expandTree<TValue>([
  root,
  nodes,
]: FlatTree<TValue>): ExpandedTree<TValue> {
  return {
    ...root,
    children: expandNodes(Array.from(nodes), root.id),
  };
}

function expandNodes<TValue>(
  flatNodes: Entry<TreeNode<TValue>['id'], FlatTreeNode<TValue>>[],
  parentId: TreeNode<TValue>['id']
): ExpandedTree<TValue>[] {
  const children = flatNodes
    .filter(([, { address }]) => address[0] === parentId)
    .sort(([, nodeA], [, nodeB]) => nodeA.address[1] - nodeB.address[1]);
  const remainingNodes = flatNodes.filter(
    ([_, node]) => !children.find(([_, child]) => node.id === child.id)
  );

  return children.map(([_, child]) => {
    const { address, ...rest } = child;

    return {
      ...rest,
      children: expandNodes(remainingNodes, rest.id),
    };
  });
}
