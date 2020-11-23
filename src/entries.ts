export type Entry<A, B> = [A, B];

export function createEntry<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
