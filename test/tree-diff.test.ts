import { getDiff, ChangeType, TreeNodeDiff } from '../src/tree-diff';
import { TreeNode } from '../src/types';

const matches: [
  TreeNode<string>[],
  TreeNode<string>[],
  TreeNodeDiff<string>[]
][] = [
  [
    [{ id: '1', value: 'a', children: [] }],
    [{ id: '1', value: 'a', children: [] }],
    [{ id: '1', value: 'a', children: [], change: [ChangeType.Unchanged] }],
  ],
  [
    [{ id: '1', value: 'a', children: [] }],
    [{ id: '1', value: 'b', children: [] }],
    [{ id: '1', value: 'b', children: [], change: [ChangeType.Updated] }],
  ],
  [
    [],
    [{ id: '1', value: 'a', children: [] }],
    [{ id: '1', value: 'a', children: [], change: [ChangeType.Inserted] }],
  ],
  [
    [{ id: '1', value: 'a', children: [] }],
    [],
    [{ id: '1', value: 'a', children: [], change: [ChangeType.Deleted] }],
  ],
];

xdescribe('it', () => {
  it('works', () => {
    matches.forEach(([treeA, treeB, diff]) => {
      expect(getDiff(treeA, treeB)).toEqual(diff);
    });
  });
});
