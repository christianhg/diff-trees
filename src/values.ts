import { Entry } from './entries';
import { TreeNode } from './types';

export type ValueEntry<TValue> = Entry<TreeNode<TValue>['id'], TValue>;

export function calculateValues<TValue>(
  tree: TreeNode<TValue>[]
): ValueEntry<TValue>[] {
  return tree
    .map(node => {
      const value: ValueEntry<TValue> = [node.id, node.value];
      const childValues = calculateValues(node.children);

      return [value, ...childValues];
    })
    .reduce((x, y) => [...x, ...y], []);
}
