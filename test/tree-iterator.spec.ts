import { createTreeIterator } from '../src/tree-iterator';
import { TreeNode } from '../src/types';

const matches: [TreeNode<{}>, Omit<TreeNode<{}>, 'children'>[]][] = [
  [{ id: '1', children: [] }, [{ id: '1' }]],
  [
    { id: '1', children: [{ id: '2', children: [] }] },
    [{ id: '1' }, { id: '2' }],
  ],
  [
    {
      id: '1',
      children: [
        { id: '2', children: [] },
        {
          id: '3',
          children: [
            { id: '4', children: [] },
            {
              id: '5',
              children: [
                { id: '7', children: [] },
                { id: '8', children: [] },
              ],
            },
            { id: '6', children: [] },
          ],
        },
      ],
    },
    [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '7' },
      { id: '8' },
      { id: '6' },
    ],
  ],
];

describe(createTreeIterator.name, () => {
  it('works', () => {
    matches.forEach(([tree, nodes]) => {
      expect([...createTreeIterator(tree)]).toEqual(nodes);
    });
  });
});
