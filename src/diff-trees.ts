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

/**
 * - Get all deleted nodes from tree A
 * - Get all inserted nodes in tree B
 * - Remove inserted nodes from tree B
 * - Add deleted nodes back to tree B
 * -
 * - Annotate tree B with "moved", "updated" and "unchanged"
 * - Add ba
 */
export function diffTrees<TValue>(
  treeA: TreeNode<TValue>,
  treeB: TreeNode<TValue>
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

  const annotatedNodes: FlatAnnotatedTreeNodes<TValue> = Array.from(nodesB).map(
    ([id, node]) => {
      const nodeA = nodesA.get(id);
      const inserted = !nodeA;
      const valueChanged = nodeA ? node.value !== nodeA.value : false;
      const moved = nodeA
        ? node.address[0] !== nodeA.address[0] ||
          node.address[1] !== nodeA.address[1]
        : false;

      const change: Change = inserted
        ? [ChangeType.Inserted]
        : valueChanged && moved
        ? [ChangeType.Moved, ChangeType.Updated]
        : valueChanged
        ? [ChangeType.Updated]
        : moved
        ? [ChangeType.Moved]
        : [ChangeType.Unchanged];

      return [
        id,
        {
          id: node.id,
          value: node.value,
          address: node.address,
          change: change,
        },
      ];
    }
  );

  const annotatedTreeB: FlatAnnotatedTree<TValue> = [
    {
      ...rootB,
      change:
        rootA.value !== rootB.value
          ? [ChangeType.Updated]
          : [ChangeType.Unchanged],
    },
    [...annotatedNodes, ...deletedNodes],
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

export function expandAnnotatedTree<TValue>([
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
