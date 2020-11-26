# diff-trees

[![npm module](https://badge.fury.io/js/diff-trees.svg)](https://www.npmjs.org/package/diff-trees)
[![Dependencies](https://david-dm.org/christianhg/diff-trees.svg)](https://david-dm.org/christianhg/diff-trees)

```ts
declare function diffTrees<TValue>(
  treeA: TreeNode<TValue>,
  treeB: TreeNode<TValue>
): DiffTreeNode<TValue>;
```

Given two trees of type:

```ts
type TreeNode<TValue> = {
  id: string;
  value: TValue;
  children: TreeNode<TValue>[];
};
```

It will produce a single tree of type:

```ts
type DiffTreeNode<TValue> = Omit<TreeNode<TValue>, 'children'> & {
  change: Change;
  children: DiffTreeNode<TValue>[];
};
```

Where `Change` is:

```ts
type Change =
  | [ChangeType.Unchanged]
  | [ChangeType.Inserted]
  | [ChangeType.Deleted]
  | [ChangeType.Updated]
  | [ChangeType.Moved]
  | [ChangeType.Moved, ChangeType.Updated];
```

The `value` in a `TreeNode` can be anything. If the `value` has changed, the `DiffTreeNode` is annotated with `ChangeType.Updated`. By default, values are compared using [strict equality (`===`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality). To change how values are compared, add a custom `valueEquality` function to the optional `options` object:

```ts
declare function diffTrees<TValue>(
  treeA: TreeNode<TValue>,
  treeB: TreeNode<TValue>,
  options?: {
    valueEquality: (a: TValue, b: TValue) => boolean;
  }
): DiffTreeNode<TValue>;
```

## Examples

```ts
diffTrees(
  { id: '1', value: 'a', children: [] },
  { id: '1', value: 'a', children: [] }
);

// =>

{
  id: '1',
  value: 'a',
  children: [],
  change: [ChangeType.Unchanged],
}
```

```ts
diffTrees(
  { id: '1', value: 'a', children: [] },
  { id: '1', value: 'a', children: [{ id: '2', value: 'b', children: [] }] }
);

// =>

{
  id: '1',
  value: 'a',
  change: [ChangeType.Unchanged],
  children: [
    { id: '2', value: 'b', change: [ChangeType.Inserted], children: [] },
  ],
}
```

```ts
diffTrees(
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
  }
);

// =>

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
    {
      id: '2',
      value: 'b',
      change: [ChangeType.Moved],
      children: [],
    },
  ],
}
```
