import { createTreeIterator } from '../src/tree-iterator';
import { TreeNode, TreeNodeContext } from '../src/types';

const matches: [
  TreeNode<{}>,
  (Omit<TreeNode<{}>, 'children'> & { address: TreeNodeContext })[]
][] = [
  [
    { id: '1', children: [] },
    [{ id: '1', address: { parentNode: undefined, index: 0 } }],
  ],
  [
    { id: '1', children: [{ id: '2', children: [] }] },
    [
      { id: '1', address: { parentNode: undefined, index: 0 } },
      { id: '2', address: { parentNode: '1', index: 0 } },
    ],
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
      { id: '1', address: { parentNode: undefined, index: 0 } },
      { id: '2', address: { parentNode: '1', index: 0 } },
      { id: '3', address: { parentNode: '1', index: 1 } },
      { id: '4', address: { parentNode: '3', index: 0 } },
      { id: '5', address: { parentNode: '3', index: 1 } },
      { id: '7', address: { parentNode: '5', index: 0 } },
      { id: '8', address: { parentNode: '5', index: 1 } },
      { id: '6', address: { parentNode: '3', index: 2 } },
    ],
  ],
];

describe(createTreeIterator.name, () => {
  it('works', () => {
    matches.forEach(([tree, nodes]) => {
      expect([
        ...createTreeIterator(tree, ({ node, context }) => ({
          ...node,
          address: context,
        })),
      ]).toEqual(nodes);
    });
  });
});
