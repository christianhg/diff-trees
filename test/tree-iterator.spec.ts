import { TreeIterator } from '../src/tree-iterator';
import { TreeNode } from '../src/types';

const matches: [TreeNode<{}>, number][] = [
  [{ id: '1', children: [] }, 1],
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
    8,
  ],
];

describe(TreeIterator.name, () => {
  it('works', () => {
    matches.forEach(([tree, length]) => {
      expect([...new TreeIterator(tree)].length).toBe(length);
    });
  });
});
