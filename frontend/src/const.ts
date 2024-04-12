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
  um: (v: number) => v * 1e3,
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
  um: v => v * 1e-3,
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
  uploadUrl: string
  linearBackend: string
  sxplrhost: string
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

export const LOGIN_METHODS = [{
  name: 'ebrains keycloak',
  href: '/hbp-oidc-v2/auth'
}]

type ChumniNg = {
  data_type: string
  resolution: number[]
  size: number[]
  transform: number[][]
  type: string // "image" | "segmentation"
}

type ChumniNifti = {
  affineMatrix: number[][]
  niftiVersion: string // "Nifti1" | "Nifti2"
  byteOrder: string // "LITTLE_ENDIAN" | "BIG_ENDIAN"
  size: number[]
  voxelSize: number[]
  spatialUnits: string
  temporalUnits: string
  dataType: string // float etc
  coordinateSystem: string // SCANNER_ANAT etc
}

export type ChumniPreflightResp = {
  fileName: string
  neuroglancer: ChumniNg
  nifti: ChumniNifti
  warnings: string[]
}

export type ChumniVolume = {
  visibility: 'public' | 'private'
  name: string
  extra: {
    data: {
      minValue: 0
      maxValue: 0
    }
    fileName: string
    fileSize: number
    fileSizeUncompressed: number
    neuroglancer: ChumniNg
    nifti: ChumniNifti
    uploaded: string
    warnings: string[]
  }
  links: {
    /**
     * Absolute path (i.e. starts with /)
     */
    normalized: string
  }
}

export const SEGMENTATION_EXPLAINER_TEXT = "A segmentation nii file can be ingested differently to an image nii file"

export function trimFilename(filename: string): string {
  if (filename.length < 10) {
    return filename
  }
  return `${filename.slice(0, 10)}...`
}

type CustomVolubaSrc = {
  id: string
  dim: number[]
  imageSource: string
  name: string
}

export type CustomSrc = {
  customSrc: CustomVolubaSrc[]
}

type Volume = {
  '@type': 'siibra/volume/v0.0.1'
  providers: {
    'neuroglancer/precomputed'?: string
    'neuroglancer/precomputed/surface'?: string
    'neuroglancer/n5'?: string
  }
}

export type TVolume = {
  id: string
  name: string
  volumes: Volume[]
  contentHash?: string
  visibility?: 'public' | 'private' | 'custom' | 'useradded' | 'bundled'
}

export function expandUrl(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url
  }
  if (/^gs:\/\//.test(url)) {
    return url.replace(/^gs:\/\//, 'https://storage.googleapis.com/')
  }
  throw new Error(`${url} cannot be parsed correctly`)
}

const protocol: Record<string, keyof Volume['providers']> = {
  "precomputed://": "neuroglancer/precomputed",
  "n5://": "neuroglancer/n5",
}

export function extractProtocolUrl(ngUrl: string): Volume {
  const returnVal: Volume = {
    "@type": "siibra/volume/v0.0.1",
    providers: {}
  }

  for (const ptlSignature in protocol){
    if (ngUrl.startsWith(ptlSignature)) {
      const protocolKey = protocol[ptlSignature]
      returnVal.providers[protocolKey] = ngUrl.replace(ptlSignature, "")
    }
  }

  return returnVal
}

export function getNgUrl(volume: Volume) {
  for (const sig in protocol) {
    const protocolKey = protocol[sig]
    if (!!volume.providers[protocolKey]) {
      return `${sig}${volume.providers[protocolKey]}`
    }
  }
  throw new Error(`Cannot decipher volume ${volume}`)
}

export const REFERENCE_ID_TO_DATA: Record<string, { transform: Mat4 }> = {
  bigbrain: {
    transform: [
      [1, 0, 0, -70677184],
      [0, 1, 0, -70010000],
      [0, 0, 1, -58788284],
      [0, 0, 0, 1],
    ],
  },
  waxholm: {
    transform: [
      [1,0,0,-9550781],
      [0,1,0,-24355468],
      [0,0,1,-9707031],
      [0,0,0,1]
    ]
  },
  allen: {
    transform: [[1,0,0,-5737500],[0,1,0,-6637500],[0,0,1,-4037500],[0,0,0,1]]
  }
}

export const REFERENCE_ID_TO_SXPLR_ROOT: Record<string, string> = {
  bigbrain: "/a:juelich:iav:atlas:v1.0.0:1/t:minds:core:referencespace:v1.0.0:a1655b99-82f1-420f-a3c2-fe80fd4c8588/p:juelich:iav:atlas:v1.0.0:4/",
  waxholm: "/a:minds:core:parcellationatlas:v1.0.0:522b368e-49a3-49fa-88d3-0870a307974a/t:minds:core:referencespace:v1.0.0:d5717c4a-0fa1-46e6-918c-b8003069ade8/p:minds:core:parcellationatlas:v1.0.0:ebb923ba-b4d5-4b82-8088-fa9215c2e1fe-v4/",
  allen: "/a:juelich:iav:atlas:v1.0.0:2/t:minds:core:referencespace:v1.0.0:265d32a0-3d84-40a5-926f-bf89f68212b9/p:minds:core:parcellationatlas:v1.0.0:05655b58-3b6f-49db-b285-64b5a0276f83/",
  mebrains: "/a:juelich:iav:atlas:v1.0.0:monkey/t:minds:core:referencespace:v1.0.0:MEBRAINS/p:minds:core:parcellationatlas:v1.0.0:e3235c039c6f54c3ba151568c829f117/"
}
export const REFERENCE_ID_TO_DARK_MODE: Record<string, boolean> = {
  bigbrain: false,
  waxholm: true,
  allen: true,
  mebrains: true,
}

export const REF_VOL_ID = 'reference-volume'
export const INC_VOL_ID = 'incoming-volume'

export function getNgLayer(volume: TVolume){
  for (const vol of volume.volumes){
    try {
      const url = getNgUrl(vol)
      return url
    } catch (e) {
      console.warn(`getIncLayer failed: ${(e as any).toString()}`)
    }
  }
  throw new Error(`getIncLayer failed: cannot find url`)
}

export function getRefLayer(volume: TVolume){
  const { id, volumes, visibility } = volume
  const url = getNgLayer(volume)

  if (visibility === "useradded") {
    return {
      id: REF_VOL_ID,
      url,
      transform: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ] as Mat4
    }
  }
  if (!(id in REFERENCE_ID_TO_DATA)) {
    throw new Error(`Cannot find ${id} in REFERENCE_ID_TO_DATA`)
  }

  return {
    ...REFERENCE_ID_TO_DATA[id],
    id: REF_VOL_ID,
    url,
  }
}

export function getIncLayer(volume: TVolume){
  const url = getNgLayer(volume)
  return {
    id: INC_VOL_ID,
    url,
    transform: [
      [1.0, 0.0, 0.0, 0],
      [0.0, 1.0, 0.0, 0],
      [0.0, 0.0, 1.0, 0],
      [0.0, 0.0, 0.0, 1.0],
    ] as Mat4,
  }
}

export type EbrainsWorkflowPayload = {
  incomingVolume: string
  contentHash?: string
  referenceVolume: string
  version: number|string
  '@type': string
  transformMatrixInNm: number[][]
  description?: string
}

export type EbrainsWorkflowResponse = {
  job_id: string
}

export type EbrainsPublishResult = {
  name: string
  status: "PENDING" | "RUNNING" | "COMPLETED" | "ERROR" 
  detail: string
}

export type User = {
  id: string
  name: string
  given_name: string
  family_name: string
  type: string
  accessToken: string
  idToken: string
}

export type EbrainsWorkflowPollResponse = {
  id: string
  param: EbrainsWorkflowPayload
  output_hash: string
  progresses: EbrainsPublishResult[]
  user: User
}
