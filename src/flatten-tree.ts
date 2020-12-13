import { createEntry } from './entries';
import { createTreeIterator } from './tree-iterator';
import { FlatTree, TreeNode } from './types';

export function flattenTree<TValues>(
  tree: TreeNode<TValues>
): FlatTree<TValues> {
  return [
    ...createTreeIterator(tree, ({ context, node }) =>
      createEntry(node.id, {
        ...node,
        context,
      })
    ),
  ];
}
