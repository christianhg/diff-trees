import { TreeNode } from './types';

export function* createTreeIterator<TValues>(
  tree: TreeNode<TValues>
): Generator<Omit<TreeNode<TValues>, 'children'>> {
  const { children, ...node } = tree;

  yield node;

  for (let index = 0; index < children.length; index++) {
    const child = children[index];

    yield* createTreeIterator(child);
  }
}
