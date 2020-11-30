import { Entry } from '../src/entries';
import { flattenTree } from '../src/flatten-tree';
import { FlatTree, TreeNode } from '../src/types';

export const flatTreeMatches: Entry<
  TreeNode<{ value: string }>,
  FlatTree<{ value: string }>
>[] = [
  [
    { id: '1', value: 'a', children: [] },
    [{ id: '1', value: 'a' }, new Map([])],
  ],
  [
    { id: '1', value: 'a', children: [{ id: '2', value: 'b', children: [] }] },
    [
      { id: '1', value: 'a' },
      new Map([['2', { id: '2', value: 'b', address: ['1', 0] }]]),
    ],
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
        ['2', { id: '2', value: 'b', address: ['1', 0] }],
        ['3', { id: '3', value: 'c', address: ['1', 1] }],
        ['5', { id: '5', value: 'e', address: ['3', 0] }],
        ['7', { id: '7', value: 'g', address: ['5', 0] }],
        ['6', { id: '6', value: 'f', address: ['3', 1] }],
        ['4', { id: '4', value: 'd', address: ['1', 2] }],
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
