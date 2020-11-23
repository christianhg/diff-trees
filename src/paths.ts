import { Entry } from './entries';
import { TreeNode } from './types';

export type PathEntry<TValue> = Entry<TreeNode<TValue>['id'], string>;

export function calculatePaths<TValue>(
  tree: TreeNode<TValue>[],
  currentPath: string = ''
): PathEntry<TValue>[] {
  return tree
    .map((node, index) => {
      const path: PathEntry<TValue> = [node.id, currentPath + index];
      const childPaths = calculatePaths(node.children, currentPath + index);

      return [path, ...childPaths];
    })
    .reduce((x, y) => [...x, ...y], []);
}
