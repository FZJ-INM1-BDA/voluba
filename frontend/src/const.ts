import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import { Landmark } from "./landmarks/const";

export type RecursivePartial<T extends Record<string, unknown>> = Partial<{
  [K in keyof T]: Partial<T[K]>;
}>;

export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
export type Mat4 = [Vec4, Vec4, Vec4, Vec4];

export const PatchedSymbol = Symbol('nehubapatched');

export function isHtmlElement(arg: any): arg is HTMLElement {
  return arg instanceof HTMLElement;
}

export type VolubeNehuba = {
  readonly mouseover: Observable<Float32Array>
  readonly mousedown: Observable<MouseEvent>
}

export const VOLUBA_NEHUBA_TOKEN = new InjectionToken<VolubeNehuba>("VOLUBA_NEHUBA_TOKEN")

export function isVec3(input: unknown): input is Vec3 {
  return Array.isArray(input) && input.length === 3
}

export function arrayEqual<T>(a: T[], b: T[], predicate: (a: T, b: T) => boolean = (a, b) => a === b): boolean {
  return a.length === b.length && a.every((v, idx) => predicate(v, b[idx]))
}

export function FloatArrayEql(a: Float32Array, b: Float32Array): boolean {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++){
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

export function isDefined<T>(v: T|null|undefined): v is T {
  return v !== null && typeof v !== 'undefined'
} 

export const DEBOUNCED_WINDOW_RESIZE = new InjectionToken<Observable<UIEvent>>("DEBOUNCED_WINDOW_RESIZE")

export type SliceViewEvent = {
  element: HTMLElement,
  sliceview: export_nehuba.SliceView
}

export function sliceViewEvEql(a: SliceViewEvent, b: SliceViewEvent): boolean {
  return a.element === b.element && a.sliceview === b.sliceview
}

export function sliceViewEvIncludes(ev: SliceViewEvent, list: SliceViewEvent[]): boolean {
  return list.some(it => sliceViewEvEql(it, ev))
}

export const EXPORT_LANDMARKS_TYPE = 'https://voluba.apps.hbp.eu/@types/landmarks'

export type OverlayLm = Landmark & { color: string, id: string, highlighted?: boolean }

export type GetNehuba = {
  getNehubaInstance(): export_nehuba.NehubaViewer|null|undefined
  provideNehubaInstance(callback: () => export_nehuba.NehubaViewer|null|undefined): void
}

export const GET_NEHUBA_INJ = new InjectionToken('GET_NEHUBA_INJ')

export const XFORM_FILE_TYPE = "https://voluba.apps.hbp.eu/@types/transform"

type CoordSpace = Record<'x'|'y'|'z', export_nehuba.Dimension>

export const cvtToNm = {
  pm: (v: number) => v * 1e-3,
  nm: (v: number) => v,
  μm: (v: number) => v * 1e3,
  mm: (v: number) => v * 1e6,
  cm: (v: number) => v * 1e7,
  m: (v: number) => v * 1e9,
  km: (v: number) => v * 1e12,
} as const

export type VoxelUnit = keyof typeof cvtToNm

export const cvtNmTo: Record<VoxelUnit, (nm: number) => number> = {
  pm: v => v * 1e3,
  nm: v => v,
  μm: v => v * 1e-3,
  mm: v => v * 1e-6,
  cm: v => v * 1e-7,
  m: v => v * 1e-9,
  km: v => v * 1e-12,
}

export function canBeConverted(a: string): a is VoxelUnit{
  return a in cvtToNm
}

function coordSpaceToNmScale(coordSpace: CoordSpace): export_nehuba.vec3 {
  const { vec3 } = export_nehuba
  const returnValues: number[] = []
  const keys: (keyof CoordSpace)[] = ['x', 'y', 'z']
  for (const key of keys){
    const [ value, unit ] = coordSpace[key]
    if (!canBeConverted(unit)){
      throw new Error(`${unit} cannot be convertd`)
    }
    returnValues.push(
      cvtToNm[unit](value)
    )
  }
  return vec3.fromValues(...returnValues)
}

export function transCoordSpcScaling(src: CoordSpace, dst: CoordSpace): export_nehuba.vec3 {
  const { vec3 } = export_nehuba
  const srcScale = coordSpaceToNmScale(src)
  const dstScale = coordSpaceToNmScale(dst)
  
  return vec3.div(vec3.create(), dstScale, srcScale) as export_nehuba.vec3
}

export type VolubaAppConfig = {
  linearBackend: string
}

export const VOLUBA_APP_CONFIG = new InjectionToken<VolubaAppConfig>("VOLUBA_APP_CONFIG")

export type LinearXformResult = {
  RMSE: number
  inverse_matrix: number[][]
  transformation_matrix: number[][]
  landmark_pairs: {
    active: boolean
    mismatch: number
    source_point: number[]
    target_point: number[]
  }[]
}
