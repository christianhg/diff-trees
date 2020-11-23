import { Entry } from '../src/entries';
import { flattenTree, FlatTree } from '../src/flatten-tree';
import { TreeNode } from '../src/types';

export const flatTreeMatches: Entry<TreeNode<string>, FlatTree<string>>[] = [
  [
    { id: '1', value: 'a', children: [] },
    [{ id: '1', value: 'a' }, new Map([])],
  ],
  [
    { id: '1', value: 'a', children: [{ id: '2', value: 'b', children: [] }] },
    [{ id: '1', value: 'a' }, new Map([[['1', 0], { id: '2', value: 'b' }]])],
  ],
  [
    {
      id: '1',
      value: 'a',
      children: [
        { id: '2', value: 'b', children: [] },
        {
          id: '3',
          value: 'c',
          children: [
            {
              id: '5',
              value: 'e',
              children: [{ id: '7', value: 'g', children: [] }],
            },
            { id: '6', value: 'f', children: [] },
          ],
        },
        { id: '4', value: 'd', children: [] },
      ],
    },
    [
      { id: '1', value: 'a' },
      new Map([
        [['1', 0], { id: '2', value: 'b' }],
        [['1', 1], { id: '3', value: 'c' }],
        [['3', 0], { id: '5', value: 'e' }],
        [['5', 0], { id: '7', value: 'g' }],
        [['3', 1], { id: '6', value: 'f' }],
        [['1', 2], { id: '4', value: 'd' }],
      ]),
    ],
  ],
];

describe(flattenTree.name, () => {
  it('works', () => {
    flatTreeMatches.forEach(([tree, flatTree]) => {
      expect(flattenTree(tree)).toEqual(flatTree);
    });
  });
});
