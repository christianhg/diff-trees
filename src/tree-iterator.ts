import { TreeNode, TreeNodeContext } from './types';

export function* createTreeIterator<TValues, TTreeNode>(
  tree: TreeNode<TValues>,
  transformer: ({
    node,
    context,
  }: {
    node: Omit<TreeNode<TValues>, 'children'>;
    context: TreeNodeContext;
  }) => TTreeNode,
  context?: TreeNodeContext
): Generator<TTreeNode> {
  const { children, ...node } = tree;

  yield transformer({
    node,
    context: context ?? { parentNode: undefined, index: 0 },
  });

  for (let index = 0; index < children.length; index++) {
    const child = children[index];

    yield* createTreeIterator(child, transformer, {
      parentNode: node.id,
      index,
    });
  }
}
