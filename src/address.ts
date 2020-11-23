import { flatten } from './array';
import { createEntry, Entry } from './entries';
import { TreeNode } from './types';

export type Address<TValue> = Entry<TreeNode<TValue>['id'], number>;

type AddressEntry<TValue> = Entry<TreeNode<TValue>['id'], Address<TValue>>;

export function calculateAddresses<TValue>(
  tree: TreeNode<TValue>[],
  parentId: TreeNode<TValue>['id']
): AddressEntry<TValue>[] {
  return flatten(
    tree.map((node, index) => {
      const address = createEntry(node.id, createEntry(parentId, index));
      const childAddresses = calculateAddresses(node.children, node.id);

      return [address, ...childAddresses];
    })
  );
}
