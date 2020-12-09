import { TreeNode } from './types';

export function* createTreeIterator<
  TValues,
  TTreeNode extends Omit<TreeNode<TValues>, 'children'>
>(
  tree: TreeNode<TValues>,
  transformer: ({
    node,
    context,
  }: {
    node: Omit<TreeNode<TValues>, 'children'>;
    context: { parentNode?: string; index: number };
  }) => TTreeNode,
  context?: { parentNode: string; index: number }
): Generator<TTreeNode> {
  const { children, ...node } = tree;

  yield transformer({ node, context: context ?? { index: 0 } });

  for (let index = 0; index < children.length; index++) {
    const child = children[index];

    yield* createTreeIterator(child, transformer, {
      parentNode: node.id,
      index,
    });
  }
}
