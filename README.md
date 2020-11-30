# diff-trees

> For diffing ordered trees

[![npm module](https://badge.fury.io/js/diff-trees.svg)](https://www.npmjs.org/package/diff-trees)
[![Dependencies](https://david-dm.org/christianhg/diff-trees.svg)](https://david-dm.org/christianhg/diff-trees)

![diff-trees](https://raw.githubusercontent.com/christianhg/diff-trees/main/diff-trees.png)

A single `diffTrees` function is exported:

```ts
declare function diffTrees<TValue>(
  treeA: TreeNode<{ value: TValue }>,
  treeB: TreeNode<{ value: TValue }>
): DiffTreeNode<TValue>;
```

It takes two trees of type `TreeNode`:

```ts
type TreeNode<TValues> = {
  id: string;
  children: TreeNode<TValues>[];
} & TValues;
```

And produces a single tree of type `DiffTreeNode`:

```ts
type DiffTreeNode<TValue> = Omit<TreeNode<{ value: TValue }>, 'children'> & {
  change: Change;
  children: DiffTreeNode<TValue>[];
};
```

Where a `Change` is:

```ts
type Change =
  | [ChangeType.Unchanged]
  | [ChangeType.Inserted]
  | [ChangeType.Deleted]
  | [ChangeType.Updated]
  | [ChangeType.Moved]
  | [ChangeType.Moved, ChangeType.Updated];
```

- `ChangeType.Unchanged` denotes unchanged nodes.
- `ChangeType.Inserted` denotes new nodes.
- `ChangeType.Deleted` denotes deleted nodes.
- `ChangeType.Updated` denotes nodes where the `value` changed.
- `ChangeType.Moved` denotes nodes that moved to another subtree or changed place within the same subtree.

---

The `value` in a `TreeNode` can is generic. If the `value` has changed, the `DiffTreeNode` is annotated with `ChangeType.Updated`. By default, values are compared using [strict equality (`===`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality). To change how values are compared, add a custom `valueEquality` function to the optional `options` object:

```ts
declare function diffTrees<TValue>(
  treeA: TreeNode<{ value: TValue }>,
  treeB: TreeNode<{ value: TValue }>,
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
