import { flatten } from './array';
import { Entry } from './entries';
import { Address, TreeNode } from './types';

type FlatTree<TValue> = [
  Pick<TreeNode<TValue>, 'id'>,
  Map<TreeNode<TValue>['id'], FlatTreeNode<TValue>>
];

type FlatTreeNode<TValue> = Pick<TreeNode<TValue>, 'id'> & {
  address: Address<TValue>;
};

export function flattenTree<TValue>(tree: TreeNode<TValue>): FlatTree<TValue> {
  const { children, ...root } = tree;

  return [root, new Map(flattenNodes(children, root.id))];
}

function flattenNodes<TValue>(
  nodes: TreeNode<TValue>[],
  parentId: TreeNode<TValue>['id']
): Entry<TreeNode<TValue>['id'], FlatTreeNode<TValue>>[] {
  return flatten(
    nodes.map((node, index) => {
      const { id, children, ...rest } = node;

      return [
        [
          id,
          {
            id,
            address: [parentId, index],
            ...rest,
          },
        ],
        ...flattenNodes(children, id),
      ];
    })
  );
}
