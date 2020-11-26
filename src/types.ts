import { Entry } from './entries';

export type TreeNode<TValue> = {
  id: string;
  value: TValue;
  children: TreeNode<TValue>[];
};

export type Address<TValue> = Entry<TreeNode<TValue>['id'], number>;
