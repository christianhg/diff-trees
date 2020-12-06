import { flattenTree } from './flatten-tree';
import { FlatTree, FlatTreeNode, TreeNode } from './types';

export class TreeIterator<TValues>
  implements Iterator<Omit<TreeNode<TValues>, 'children'>> {
  private flatTree: FlatTree<TValues>;
  private doneRoot: boolean = false;
  private nodeIterator: IterableIterator<FlatTreeNode<TValues>>;

  constructor(tree: TreeNode<TValues>) {
    this.flatTree = flattenTree(tree);
    this.nodeIterator = this.flatTree[1].values();
  }

  next() {
    if (!this.doneRoot) {
      this.doneRoot = true;

      return {
        done: false,
        value: this.flatTree[0],
      };
    }

    return this.nodeIterator.next();
  }

  [Symbol.iterator]() {
    return this;
  }
}
