import { Entry } from './entries';

type BaseTreeNode<TValues> = {
  id: string;
  children: BaseTreeNode<TValues>[];
} & TValues;

type FlatTree<TValues> = [
  Omit<BaseTreeNode<TValues>, 'children'>,
  Map<string, FlatTreeNode<TValues>>
];

type FlatTreeNode<TValues> = Omit<BaseTreeNode<TValues>, 'children'> & {
  address: [string, number];
};

export function expandTree<TValues>([
  root,
  nodes,
]: FlatTree<TValues>): BaseTreeNode<TValues> {
  return {
    ...root,
    children: expandNodes(Array.from(nodes), root.id),
  } as BaseTreeNode<TValues>;
}

function expandNodes<TValues>(
  flatNodes: Entry<string, FlatTreeNode<TValues>>[],
  parentId: string
): BaseTreeNode<TValues>[] {
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
    } as BaseTreeNode<TValues>;

    return expandedNode;
  });
}
