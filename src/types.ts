import { Entry } from './entries';

export type TreeNode<Value> = {
  id: string;
  value: Value;
  children: TreeNode<Value>[];
};

export type Address<TValue> = Entry<TreeNode<TValue>['id'], number>;
