import { flattenTree } from './flatten-tree';
import { expandTree } from './expand-tree';
import { FlatTree, FlatTreeNode, TreeNode } from './types';

export enum ChangeType {
  Inserted = 'inserted',
  Deleted = 'deleted',
  Moved = 'moved',
  Unchanged = 'unchanged',
  Updated = 'updated',
}

export type Change =
  | [ChangeType.Unchanged]
  | [ChangeType.Inserted]
  | [ChangeType.Deleted]
  | [ChangeType.Updated]
  | [ChangeType.Moved]
  | [ChangeType.Moved, ChangeType.Updated];

export type DiffTree<TValue> =
  | [DiffTreeNode<TValue>]
  | [DiffTreeNode<TValue>, DiffTreeNode<TValue>];

export type DiffTreeNode<TValue> = Omit<
  TreeNode<{ value: TValue }>,
  'children'
> & {
  change: Change;
  children: DiffTreeNode<TValue>[];
};

export { TreeNode };

export function diffTrees<TValue>(
  treeA: TreeNode<{ value: TValue }>,
  treeB: TreeNode<{ value: TValue }>,
  options: { valueEquality: (a: TValue, b: TValue) => boolean } = {
    valueEquality: (a, b) => a === b,
  }
): DiffTree<TValue> {
  const flatTreeA = flattenTree(treeA);
  const rootA = flatTreeA.shift()![1];
  const nodesA = new Map(flatTreeA);

  const flatTreeB = flattenTree(treeB);
  const rootB = flatTreeB.shift()![1];
  const nodesB = new Map(flatTreeB);

  const deletedNodes: FlatDiffTreeNodes<TValue> = Array.from(nodesA)
    .filter(([id]) => !nodesB.get(id) && id !== rootB.id)
    .map(([id, node]) => [
      id,
      {
        id: node.id,
        value: node.value,
        context: node.context,
        change: [ChangeType.Deleted],
      },
    ]);

  const insertedAndChanged: FlatDiffTreeNodes<TValue> = Array.from(nodesB).map(
    ([id, node]) => {
      const oldNode = id === rootA.id ? rootA : nodesA.get(id);
      const inserted = !oldNode;
      const valueChanged = oldNode
        ? !options.valueEquality(node.value, oldNode.value)
        : false;

      return [
        id,
        {
          id: node.id,
          value: node.value,
          context: node.context,
          change: inserted
            ? [ChangeType.Inserted]
            : valueChanged
            ? [ChangeType.Updated]
            : [ChangeType.Unchanged],
        },
      ];
    }
  );

  const deletedInsertedAndChanged: FlatDiffTreeNodes<TValue> = [
    ...deletedNodes,
    ...insertedAndChanged,
  ];

  const flatTreeDiffNodes: FlatDiffTreeNodes<TValue> =
    deletedInsertedAndChanged.map(([id, node]) => {
      if (
        node.change[0] === ChangeType.Inserted ||
        node.change[0] === ChangeType.Deleted
      ) {
        return [id, node];
      }

      const originalContext = nodesA.get(id)?.context;

      const definitelyMoved =
        (originalContext &&
          originalContext.parentNode !== node.context.parentNode) ||
        rootA.id === id;

      if (definitelyMoved) {
        return [
          id,
          {
            id: node.id,
            value: node.value,
            context: node.context,
            change:
              node.change[0] === ChangeType.Unchanged
                ? [ChangeType.Moved]
                : node.change[0] === ChangeType.Updated
                ? [ChangeType.Moved, ChangeType.Updated]
                : [ChangeType.Moved],
          },
        ];
      }

      const mightHaveMoved = originalContext
        ? originalContext.parentNode === node.context.parentNode &&
          originalContext.index !== node.context.index
        : false;

      if (originalContext && mightHaveMoved) {
        const siblingsAbove = deletedInsertedAndChanged
          .filter(
            ([_, sib]) => sib.context.parentNode === node.context.parentNode
          )
          .filter(([id]) => id !== node.id)
          .filter(([_, sib]) => sib.context.index <= node.context.index)
          .filter(([_, sib]) => sib.change[0] !== ChangeType.Inserted);

        const movedUp =
          node.context.index < originalContext.index &&
          siblingsAbove.length !== originalContext.index;
        const movedDown =
          node.context.index > originalContext.index &&
          siblingsAbove.length > originalContext.index;

        if (movedUp || movedDown) {
          return [
            id,
            {
              id: node.id,
              value: node.value,
              context: node.context,
              change:
                node.change[0] === ChangeType.Unchanged
                  ? [ChangeType.Moved]
                  : node.change[0] === ChangeType.Updated
                  ? [ChangeType.Moved, ChangeType.Updated]
                  : [ChangeType.Moved],
            },
          ];
        }
      }

      return [id, node];
    });

  const oldRoot = rootB.id === rootA.id ? rootA : nodesA.get(rootB.id);

  const flatDiffTree: FlatDiffTree<TValue> = [
    [
      rootB.id,
      oldRoot
        ? {
            ...rootB,
            change:
              nodesA.get(rootB.id) &&
              !options.valueEquality(oldRoot.value, rootB.value)
                ? [ChangeType.Moved, ChangeType.Updated]
                : nodesA.get(rootB.id)
                ? [ChangeType.Moved]
                : !options.valueEquality(oldRoot.value, rootB.value)
                ? [ChangeType.Updated]
                : [ChangeType.Unchanged],
          }
        : {
            ...rootB,
            change: [ChangeType.Inserted],
          },
    ],
    ...flatTreeDiffNodes,
  ];

  if (rootA.id !== rootB.id && !nodesB.get(rootA.id)) {
    return [
      expandTree(flatDiffTree),
      expandTree([
        [rootA.id, { ...rootA, change: [ChangeType.Deleted] }],
        ...deletedNodes,
      ]),
    ];
  } else {
    return [expandTree(flatDiffTree)];
  }
}

type FlatDiffTree<TValue> = FlatTree<{ value: TValue; change: Change }>;

type FlatDiffTreeNodes<TValue> = [
  string,
  FlatTreeNode<{ value: TValue; change: Change }>
][];
