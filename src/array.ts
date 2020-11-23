export function flatten<A>(xs: A[][]): A[] {
  return xs.reduce((x, y) => [...x, ...y], []);
}
