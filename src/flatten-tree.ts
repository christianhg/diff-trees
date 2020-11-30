import { flatten } from './array';
import { createEntry, Entry } from './entries';
import { FlatTree, FlatTreeNode, TreeNode } from './types';

export function flattenTree<TValues>(
  tree: TreeNode<TValues>
): FlatTree<TValues> {
  const { children, ...root } = tree;

  return [root, new Map(flattenNodes(children, root.id))];
}

function flattenNodes<TValues>(
  nodes: TreeNode<TValues>[],
  parentId: string
): Entry<string, FlatTreeNode<TValues>>[] {
  return flatten(
    nodes.map((node, index) => {
      const { id, children, ...rest } = node;
      const flatNode = {
        id,
        address: [parentId, index],
        ...rest,
      } as FlatTreeNode<TValues>;

      return [createEntry(id, flatNode), ...flattenNodes(children, id)];
    })
  );
}
