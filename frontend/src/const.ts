export type RecursivePartial<T extends Record<string, unknown>> = Partial<{
    [K in keyof T]: Partial<T[K]>
}>

export type Vec3 = [number, number, number]
export type Vec4 = [number, number, number, number]
export type Mat4 = [Vec4, Vec4, Vec4, Vec4]

export const PatchedSymbol = Symbol('nehubapatched')

export function isHtmlElement(arg: any): arg is HTMLElement {
  return arg instanceof HTMLElement
}
