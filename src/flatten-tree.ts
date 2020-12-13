import { createEntry } from './entries';
import { createTreeIterator } from './tree-iterator';
import { FlatTree, TreeNode } from './types';

export function flattenTree<TValues>(
  tree: TreeNode<TValues>
): FlatTree<TValues> {
  const [[, root], ...children] = [
    ...createTreeIterator(tree, ({ context, node }) =>
      createEntry(node.id, {
        ...node,
        context,
      })
    ),
  ];

  return [root, new Map(children)];
}
