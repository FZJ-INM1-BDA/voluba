import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

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
  return a.every((v, idx) => predicate(v, b[idx])) && a.length === b.length
}

export function isDefined<T>(v: T|null|undefined): v is T {
  return v !== null && typeof v !== 'undefined'
} 

export const DEBOUNCED_WINDOW_RESIZE = new InjectionToken<Observable<UIEvent>>("DEBOUNCED_WINDOW_RESIZE")

export type SliceViewEvent = {
  element: HTMLElement,
  sliceview: export_nehuba.SliceView
}

export interface SliceViewProviderType {
  observable: Observable<SliceViewEvent[]>
  register: (ev: SliceViewEvent) => void
}

export const SLICEVIEWS_INJECTION_TOKEN = new InjectionToken<SliceViewProviderType>("SLICEVIEWS_INJECTION_TOKEN")

export function sliceViewEvEql(a: SliceViewEvent, b: SliceViewEvent): boolean {
  return a.element === b.element && a.sliceview === b.sliceview
}

export function sliceViewEvIncludes(ev: SliceViewEvent, list: SliceViewEvent[]): boolean {
  return list.some(it => sliceViewEvEql(it, ev))
}
