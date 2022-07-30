import { describe, expect, it } from 'vitest';
import { ChangeType, DiffTree, diffTrees, TreeNode } from '../src/index';

const diffTreesMatches: [
  TreeNode<{ value: string }>,
  TreeNode<{ value: string }>,
  DiffTree<string>
][] = [
  [
    { id: '1', value: 'a', children: [{ id: '2', value: 'b', children: [] }] },
    { id: '2', value: 'b', children: [{ id: '1', value: 'a', children: [] }] },
    [
      {
        id: '2',
        value: 'b',
        change: [ChangeType.Moved],
        children: [
          { id: '1', value: 'a', change: [ChangeType.Moved], children: [] },
        ],
      },
    ],
  ],
  [
    { id: '1', value: 'a', children: [{ id: '2', value: 'b', children: [] }] },
    {
      id: '2',
      value: 'b2',
      children: [{ id: '1', value: 'a2', children: [] }],
    },
    [
      {
        id: '2',
        value: 'b2',
        change: [ChangeType.Moved, ChangeType.Updated],
        children: [
          {
            id: '1',
            value: 'a2',
            change: [ChangeType.Moved, ChangeType.Updated],
            children: [],
          },
        ],
      },
    ],
  ],
  [
    { id: '1', value: 'a', children: [{ id: '2', value: 'b', children: [] }] },
    { id: '2', value: 'b', children: [] },
    [
      {
        id: '2',
        value: 'b',
        change: [ChangeType.Moved],
        children: [],
      },
      { id: '1', value: 'a', change: [ChangeType.Deleted], children: [] },
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
            { id: '4', value: 'd', children: [] },
            { id: '5', value: 'e', children: [] },
          ],
        },
      ],
    },
    { id: '3', value: 'c2', children: [{ id: '5', value: 'e', children: [] }] },
    [
      {
        id: '3',
        value: 'c2',
        change: [ChangeType.Moved, ChangeType.Updated],
        children: [
          { id: '4', value: 'd', change: [ChangeType.Deleted], children: [] },
          { id: '5', value: 'e', change: [ChangeType.Unchanged], children: [] },
        ],
      },
      {
        id: '1',
        value: 'a',
        change: [ChangeType.Deleted],
        children: [
          { id: '2', value: 'b', change: [ChangeType.Deleted], children: [] },
        ],
      },
    ],
  ],
  [
    { id: '1', value: 'a', children: [] },
    { id: '1', value: 'a', children: [] },
    [{ id: '1', value: 'a', change: [ChangeType.Unchanged], children: [] }],
  ],
  [
    { id: '1', value: 'a', children: [] },
    { id: '1', value: 'a', children: [{ id: '2', value: 'b', children: [] }] },
    [
      {
        id: '1',
        value: 'a',
        change: [ChangeType.Unchanged],
        children: [
          { id: '2', value: 'b', change: [ChangeType.Inserted], children: [] },
        ],
      },
    ],
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
    [
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
  ],
  [
    {
      id: '1',
      value: 'a',
      children: [{ id: '2', value: 'b', children: [] }],
    },
    {
      id: '1',
      value: 'a',
      children: [
        { id: '3', value: 'c', children: [] },
        { id: '2', value: 'b', children: [] },
      ],
    },
    [
      {
        id: '1',
        value: 'a',
        change: [ChangeType.Unchanged],
        children: [
          { id: '3', value: 'c', change: [ChangeType.Inserted], children: [] },
          { id: '2', value: 'b', change: [ChangeType.Unchanged], children: [] },
        ],
      },
    ],
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
      children: [{ id: '3', value: 'c', children: [] }],
    },
    [
      {
        id: '1',
        value: 'a',
        change: [ChangeType.Unchanged],
        children: [
          { id: '2', value: 'b', change: [ChangeType.Deleted], children: [] },
          { id: '3', value: 'c', change: [ChangeType.Unchanged], children: [] },
        ],
      },
    ],
  ],
  [
    {
      id: '1',
      value: 'a',
      children: [
        {
          id: '2',
          value: 'b',
          children: [
            {
              id: '3',
              value: 'c',
              children: [
                { id: '4', value: 'd', children: [] },
                { id: '5', value: 'e', children: [] },
                { id: '6', value: 'f', children: [] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '1',
      value: 'a',
      children: [
        {
          id: '2',
          value: 'b',
          children: [
            { id: '4', value: 'd', children: [] },
            { id: '5', value: 'e', children: [] },
            { id: '6', value: 'f', children: [] },
          ],
        },
      ],
    },
    [
      {
        id: '1',
        value: 'a',
        change: [ChangeType.Unchanged],
        children: [
          {
            id: '2',
            value: 'b',
            change: [ChangeType.Unchanged],
            children: [
              {
                id: '3',
                value: 'c',
                children: [],
                change: [ChangeType.Deleted],
              },
              { id: '4', value: 'd', children: [], change: [ChangeType.Moved] },
              { id: '5', value: 'e', children: [], change: [ChangeType.Moved] },
              { id: '6', value: 'f', children: [], change: [ChangeType.Moved] },
            ],
          },
        ],
      },
    ],
  ],
];
type CustomValue = { version: string; backendId?: string };
const customValueEquality: [
  TreeNode<{ value: CustomValue }>,
  TreeNode<{ value: CustomValue }>,
  DiffTree<CustomValue>
][] = [
  [
    {
      id: '1',
      value: {
        version: '1',
      },
      children: [],
    },
    {
      id: '1',
      value: {
        version: '1',
      },
      children: [],
    },
    [
      {
        id: '1',
        value: {
          version: '1',
        },
        change: [ChangeType.Unchanged],
        children: [],
      },
    ],
  ],
  [
    {
      id: '1',
      value: {
        version: '1',
      },
      children: [],
    },
    {
      id: '1',
      value: {
        version: '1',
        backendId: 'b1',
      },
      children: [],
    },
    [
      {
        id: '1',
        value: {
          version: '1',
          backendId: 'b1',
        },
        change: [ChangeType.Updated],
        children: [],
      },
    ],
  ],
];

describe(diffTrees.name, () => {
  it('works', () => {
    diffTreesMatches.forEach(([treeA, treeB, diffTree]) => {
      expect(diffTrees(treeA, treeB)).toEqual(diffTree);
    });
  });

  it('works with custom value equality', () => {
    customValueEquality.forEach(([treeA, treeB, diffTree]) => {
      expect(
        diffTrees(treeA, treeB, {
          valueEquality: (a, b) =>
            a.version === b.version && a.backendId === b.backendId,
        })
      ).toEqual(diffTree);
    });
  });
});
