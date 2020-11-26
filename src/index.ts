import { Entry } from './entries';
import { flattenTree } from './flatten-tree';
import { Address, TreeNode } from './types';

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

export type DiffTreeNode<TValue> = Omit<TreeNode<TValue>, 'children'> & {
  change: Change;
  children: DiffTreeNode<TValue>[];
};

export function diffTrees<TValue>(
  treeA: TreeNode<TValue>,
  treeB: TreeNode<TValue>,
  options: { valueEquality: (a: TValue, b: TValue) => boolean } = {
    valueEquality: (a, b) => a === b,
  }
): DiffTreeNode<TValue> {
  const [rootA, nodesA] = flattenTree(treeA);
  const [rootB, nodesB] = flattenTree(treeB);

  const deletedNodes: FlatDiffTreeNodes<TValue> = Array.from(nodesA)
    .filter(([id]) => !nodesB.get(id))
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
      const nodeA = nodesA.get(id);
      const inserted = !nodeA;
      const valueChanged = nodeA
        ? !options.valueEquality(node.value, nodeA.value)
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
        originalAddress && originalAddress[0] !== node.address[0];

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

  const flatDiffTree: FlatDiffTree<TValue> = [
    {
      ...rootB,
      change: !options.valueEquality(rootA.value, rootB.value)
        ? [ChangeType.Updated]
        : [ChangeType.Unchanged],
    },
    flatTreeDiffNodes,
  ];

  return expandDiffTree(flatDiffTree);
}

type FlatDiffTree<TValue> = [
  Omit<TreeNode<TValue>, 'children'> & {
    change: Change;
  },
  FlatDiffTreeNodes<TValue>
];

type FlatDiffTreeNode<TValue> = Entry<
  TreeNode<TValue>['id'],
  Omit<TreeNode<TValue>, 'children'> & {
    address: Address<TValue>;
    change: Change;
  }
>;

type FlatDiffTreeNodes<TValue> = FlatDiffTreeNode<TValue>[];

function expandDiffTree<TValue>([
  root,
  nodes,
]: FlatDiffTree<TValue>): DiffTreeNode<TValue> {
  return {
    id: root.id,
    value: root.value,
    change: root.change,
    children: expandDiffTreeNodes(Array.from(nodes), root.id),
  };
}

function expandDiffTreeNodes<TValue>(
  flatNodes: FlatDiffTreeNodes<TValue>,
  parentId: string
): DiffTreeNode<TValue>[] {
  const children = flatNodes
    .filter(([, { address }]) => address[0] === parentId)
    .sort(([, nodeA], [, nodeB]) => nodeA.address[1] - nodeB.address[1]);
  const rest = flatNodes.filter(
    ([_, node]) => !children.find(([_, child]) => node.id === child.id)
  );

  return children.map(([_, child]) => ({
    id: child.id,
    value: child.value,
    change: child.change,
    children: expandDiffTreeNodes(rest, child.id),
  }));
}
