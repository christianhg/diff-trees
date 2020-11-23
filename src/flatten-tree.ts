import { flatten } from './array';
import { createEntry } from './entries';
import { Address, TreeNode } from './types';

export type FlatTree<TValue> = [
  Omit<TreeNode<TValue>, 'children'>,
  FlatNodes<TValue>
];

export type FlatNodes<TValue> = (Omit<TreeNode<TValue>, 'children'> & {
  address: Address<TValue>;
})[];

export function flattenTree<TValue>(tree: TreeNode<TValue>): FlatTree<TValue> {
  return [
    { id: tree.id, value: tree.value },
    flattenNodes(tree.children, tree.id),
  ];
}

function flattenNodes<TValue>(
  nodes: TreeNode<TValue>[],
  parentId: string
): (Omit<TreeNode<TValue>, 'children'> & { address: Address<TValue> })[] {
  return flatten(
    nodes.map((node, index) => {
      const address = createEntry(parentId, index);
      const children = flattenNodes(node.children, node.id);

      return [
        {
          id: node.id,
          value: node.value,
          address,
        },
        ...children,
      ];
    })
  );
}
