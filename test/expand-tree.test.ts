import { createEntry } from '../src/entries';
import { expandTree } from '../src/expand-tree';
import { flatTreeMatches } from './flatten-tree.test';

const expandTreeMatches = flatTreeMatches.map(([tree, flatTree]) =>
  createEntry(flatTree, tree)
);

describe(expandTree.name, () => {
  it('works', () => {
    expandTreeMatches.forEach(([flatTree, tree]) => {
      expect(expandTree(flatTree)).toEqual(tree);
    });
  });
});
