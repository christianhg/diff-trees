export type TreeNode<TValues> = {
  id: string;
  children: TreeNode<TValues>[];
} & TValues;

export type TreeNodeContext =
  | { parentNode: undefined; index: 0 }
  | { parentNode: string; index: number };

export type FlatTree<TValues> = [
  Omit<TreeNode<TValues>, 'children'>,
  Map<string, FlatTreeNode<TValues>>
];

export type FlatTreeNode<TValues> = Omit<TreeNode<TValues>, 'children'> & {
  address: [string, number];
};
