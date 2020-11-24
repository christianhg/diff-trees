import { ChangeType, DiffTree, diffTrees } from '../src/diff-trees';
import { TreeNode } from '../src/types';

const diffTreesMatches: [
  TreeNode<string>,
  TreeNode<string>,
  DiffTree<string>
][] = [
  [
    { id: '1', value: 'a', children: [] },
    { id: '1', value: 'a', children: [] },
    { id: '1', value: 'a', children: [], change: [ChangeType.Unchanged] },
  ],
  [
    { id: '1', value: 'a', children: [] },
    { id: '1', value: 'a', children: [{ id: '2', value: 'b', children: [] }] },
    {
      id: '1',
      value: 'a',
      children: [
        { id: '2', value: 'b', children: [], change: [ChangeType.Inserted] },
      ],
      change: [ChangeType.Unchanged],
    },
  ],
  [
    {
      id: '1',
      value: 'a',
      children: [
        { id: '2', value: 'b', children: [] },
        { id: '3', value: 'c', children: [] },
      ],
    },
    {
      id: '1',
      value: 'a',
      children: [
        { id: '3', value: 'c2', children: [] },
        { id: '2', value: 'b', children: [] },
      ],
    },
    {
      id: '1',
      value: 'a',
      change: [ChangeType.Unchanged],
      children: [
        {
          id: '3',
          value: 'c2',
          change: [ChangeType.Moved, ChangeType.Updated],
          children: [],
        },
        { id: '2', value: 'b', change: [ChangeType.Moved], children: [] },
      ],
    },
  ],
];

describe(diffTrees.name, () => {
  it('works', () => {
    diffTreesMatches.forEach(([treeA, treeB, diffTree]) => {
      expect(diffTrees(treeA, treeB)).toEqual(diffTree);
    });
  });
});