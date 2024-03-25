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
