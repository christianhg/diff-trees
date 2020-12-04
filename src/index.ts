import { Entry } from './entries';
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

type Change =
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

export function diffTrees<TValue>(
  treeA: TreeNode<{ value: TValue }>,
  treeB: TreeNode<{ value: TValue }>,
  options: { valueEquality: (a: TValue, b: TValue) => boolean } = {
    valueEquality: (a, b) => a === b,
  }
): DiffTree<TValue> {
  const [rootA, nodesA] = flattenTree(treeA);
  const [rootB, nodesB] = flattenTree(treeB);

  const deletedNodes: FlatDiffTreeNodes<TValue> = Array.from(nodesA)
    .filter(([id]) => !nodesB.get(id) && id !== rootB.id)
    .map(([id, node]) => [
      id,
      {
        id: node.id,
        value: node.value,
        address: node.address,
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
          address: node.address,
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

  const flatTreeDiffNodes: FlatDiffTreeNodes<TValue> = deletedInsertedAndChanged.map(
    ([id, node]) => {
      if (
        node.change[0] === ChangeType.Inserted ||
        node.change[0] === ChangeType.Deleted
      ) {
        return [id, node];
      }

      const originalAddress = nodesA.get(id)?.address;

      const definitelyMoved =
        (originalAddress && originalAddress[0] !== node.address[0]) ||
        rootA.id === id;

      if (definitelyMoved) {
        return [
          id,
          {
            id: node.id,
            value: node.value,
            address: node.address,
            change:
              node.change[0] === ChangeType.Unchanged
                ? [ChangeType.Moved]
                : node.change[0] === ChangeType.Updated
                ? [ChangeType.Moved, ChangeType.Updated]
                : [ChangeType.Moved],
          },
        ];
      }

      const mightHaveMoved = originalAddress
        ? originalAddress[0] === node.address[0] &&
          originalAddress[1] !== node.address[1]
        : false;

      if (originalAddress && mightHaveMoved) {
        const siblingsAbove = deletedInsertedAndChanged
          .filter(([_, sib]) => sib.address[0] === node.address[0])
          .filter(([id]) => id !== node.id)
          .filter(([_, sib]) => sib.address[1] <= node.address[1])
          .filter(([_, sib]) => sib.change[0] !== ChangeType.Inserted);

        const movedUp =
          node.address[1] < originalAddress[1] &&
          siblingsAbove.length !== originalAddress[1];
        const movedDown =
          node.address[1] > originalAddress[1] &&
          siblingsAbove.length > originalAddress[1];

        if (movedUp || movedDown) {
          return [
            id,
            {
              id: node.id,
              value: node.value,
              address: node.address,
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
    }
  );

  const oldRoot = rootB.id === rootA.id ? rootA : nodesA.get(rootB.id);

  const flatDiffTree: FlatDiffTree<TValue> = [
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
    new Map(flatTreeDiffNodes),
  ];

  if (rootA.id !== rootB.id && !nodesB.get(rootA.id)) {
    return [
      expandTree(flatDiffTree),
      expandTree([
        { ...rootA, change: [ChangeType.Deleted] },
        new Map(deletedNodes),
      ]),
    ];
  } else {
    return [expandTree(flatDiffTree)];
  }
}

type FlatDiffTree<TValue> = FlatTree<{ value: TValue; change: Change }>;

type FlatDiffTreeNodes<TValue> = Entry<
  string,
  FlatTreeNode<{ value: TValue; change: Change }>
>[];
