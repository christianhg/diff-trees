import { TreeNode } from './types';

export enum ChangeType {
  Inserted,
  Deleted,
  Moved,
  Unchanged,
  Updated,
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

// function annotateTreeA<TValue>(
//   treeA: TreeNode<TValue>,
//   treeB: TreeNode<TValue>
// ): TreeNodeDiff<TValue>[] {
//   const treeAAddresses = calculateAddresses(treeA.children, treeA.id);
//   const treeBAddresses = calculateAddresses(treeB.children, treeB.id);

//   // return treeA.map(node => )
// }

export function getDiff<TValue>(
  treeA: TreeNode<TValue>[],
  treeB: TreeNode<TValue>[]
): TreeNodeDiff<TValue>[] {
  console.log(treeA);
  console.log(treeB);

  return [];
  //   const treeAPaths = new Map(calculatePaths(treeA));
  //   const treeBPaths = new Map(calculatePaths(treeB));
  //   const treeAValues = new Map(calculateValues(treeA));

  //   const before: TreeNodeDiff<TValue>[] = new Map(
  //     treeA.map((node) => {
  //       const pathAfter = treeBPaths.get(node.id);

  //       if (!pathAfter) {
  //         return createEntry(node.id, {
  //           id: node.id,
  //           value: node.value,
  //           children: [],
  //           change: [ChangeType.Deleted],
  //         });
  //       }

  //       return createEntry(node.id, {
  //         id: node.id,
  //         value: node.value,
  //         children: [],
  //         change: [ChangeType.Unchanged],
  //       });
  //     })
  //   );

  //   const after: TreeNodeDiff<TValue>[] = treeB.map((nodeB) => {
  //     const pathBefore = treeAPaths.get(nodeB.id);
  //     const valueBefore = treeAValues.get(nodeB.id);

  //     if (!pathBefore) {
  //       return {
  //         id: nodeB.id,
  //         value: nodeB.value,
  //         children: [],
  //         change: [ChangeType.Inserted],
  //       };
  //     }

  //     if (valueBefore && valueBefore !== nodeB.value) {
  //       return {
  //         id: nodeB.id,
  //         value: nodeB.value,
  //         children: [],
  //         change: [ChangeType.Updated],
  //       };
  //     }

  //     return {
  //       id: nodeB.id,
  //       value: nodeB.value,
  //       children: [],
  //       change: [ChangeType.Unchanged],
  //     };
  //   });

  //   return x;
}
