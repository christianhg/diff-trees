import { flatten } from './array';
import { createEntry, Entry } from './entries';

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

export function flattenTree<TValues>(
  tree: BaseTreeNode<TValues>
): FlatTree<TValues> {
  const { children, ...root } = tree;

  return [root, new Map(flattenNodes(children, root.id))];
}

function flattenNodes<TValues>(
  nodes: BaseTreeNode<TValues>[],
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
