import { flatten } from './array';
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
): [string, FlatTreeNode<TValues>][] {
  return flatten(
    nodes.map((node, index) => {
      const { id, children, ...rest } = node;
      const flatNode = {
        id,
        context: [parentId, index],
        ...rest,
      } as FlatTreeNode<TValues>;

      return [[id, flatNode], ...flattenNodes(children, id)];
    })
  );
}
