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

export type TreeNodeDiff<Value> = {
  id: string;
  value: Value;
  change: Change;
  children: TreeNodeDiff<Value>[];
};

export type DiffTree<TValue> = TreeNodeDiff<TValue>;

export function diffTrees<TValue>(
  treeA: TreeNode<TValue>,
  treeB: TreeNode<TValue>,
  options: { valueEquality: (a: TValue, b: TValue) => boolean } = {
    valueEquality: (a, b) => a === b,
  }
): DiffTree<TValue> {
  const flatTreeA = flattenTree(treeA);
  const flatTreeB = flattenTree(treeB);
  const [rootA, nodesA] = flatTreeA;
  const [rootB, nodesB] = flatTreeB;

  const deletedNodes: FlatAnnotatedTreeNodes<TValue> = Array.from(nodesA)
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

  const insertedAndChanged: FlatAnnotatedTreeNodes<TValue> = Array.from(
    nodesB
  ).map(([id, node]) => {
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
  });

  const deletedInsertedAndChanged: FlatAnnotatedTreeNodes<TValue> = [
    ...deletedNodes,
    ...insertedAndChanged,
  ];

  const annotatedNodes: FlatAnnotatedTreeNodes<TValue> = deletedInsertedAndChanged.map(
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
        const siblings = deletedInsertedAndChanged
          .filter(([_, sib]) => sib.address[0] === node.address[0])
          .filter(([id]) => id !== node.id)
          .filter(([_, sib]) => sib.address[1] <= node.address[1])
          .filter(([_, sib]) => sib.change[0] !== ChangeType.Inserted);

        const movedUp = node.address[1] < originalAddress[1];
        const movedDown = node.address[1] > originalAddress[1];

        if (
          (movedUp && siblings.length !== originalAddress[1]) ||
          (movedDown && siblings.length > originalAddress[1])
        ) {
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

  const annotatedTreeB: FlatAnnotatedTree<TValue> = [
    {
      ...rootB,
      change: !options.valueEquality(rootA.value, rootB.value)
        ? [ChangeType.Updated]
        : [ChangeType.Unchanged],
    },
    annotatedNodes,
  ];

  const expandedAnnotatedTreeB = expandAnnotatedTree(annotatedTreeB);

  return expandedAnnotatedTreeB;
}

type AnnotatedTreeNode<TValue> = Omit<TreeNode<TValue>, 'children'> & {
  children: AnnotatedTreeNode<TValue>[];
  change: Change;
};

type FlatAnnotatedTree<TValue> = [
  Omit<TreeNode<TValue>, 'children'> & {
    change: Change;
  },
  FlatAnnotatedTreeNodes<TValue>
];

type FlatAnnotatedTreeNode<TValue> = Entry<
  TreeNode<TValue>['id'],
  Omit<TreeNode<TValue>, 'children'> & {
    address: Address<TValue>;
    change: Change;
  }
>;

type FlatAnnotatedTreeNodes<TValue> = FlatAnnotatedTreeNode<TValue>[];

function expandAnnotatedTree<TValue>([
  root,
  nodes,
]: FlatAnnotatedTree<TValue>): AnnotatedTreeNode<TValue> {
  return {
    id: root.id,
    value: root.value,
    change: root.change,
    children: expandAnnotatedNodes(Array.from(nodes), root.id),
  };
}

function expandAnnotatedNodes<TValue>(
  flatNodes: FlatAnnotatedTreeNodes<TValue>,
  parentId: string
): AnnotatedTreeNode<TValue>[] {
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
    children: expandAnnotatedNodes(rest, child.id),
  }));
}
