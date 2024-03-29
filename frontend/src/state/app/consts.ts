
export const STAGE = {
  SELECTION: 'SELECTION',
  ALIGNMENT: 'ALIGNMENT',
} as const

export const MODE = {
  DEFAULT: "DEFAULT",
  SIDE_BY_SIDE: "SIDE_BY_SIDE",
} as const

export type Landmark = {
  targetVolumeId: string
  position: number[]
}

export type LandmarkPair = {
  tmplLm: Landmark
  incLm: Landmark
  id: string
  name: string
}

export type User = {
  fullname: string
  authtoken: string
}

export type LocalState = {
  user: User|null
  stage: keyof typeof STAGE
  mode: keyof typeof MODE
  incLocked: boolean
  addingLandmark: boolean
  landmarkPairs: LandmarkPair[]
  purgatory: Landmark|null
  hoveredLandmark: Landmark|null
}

export const defaultState: LocalState = {
  user: null,
  stage: STAGE.SELECTION,
  mode: MODE.DEFAULT,
  addingLandmark: false,
  incLocked: false,
  landmarkPairs: [],
  purgatory: null,
  hoveredLandmark: null,
}

export const nameSpace = `app`
