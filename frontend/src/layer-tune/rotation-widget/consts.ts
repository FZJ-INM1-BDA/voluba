export type SvgPath = {
  path: {
    type: 'M' | 'C' | 'z'
    coords: number[][]
  }[]
}
