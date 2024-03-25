
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
};

export type LandmarkPair = {
  tmplLm: Landmark
  incLm: Landmark
  id: string
  name: string
}

export type LocalState = {
  stage: keyof typeof STAGE
  mode: keyof typeof MODE
  incLocked: boolean
  addingLandmark: boolean
  landmarkPairs: LandmarkPair[]
  purgatory: Landmark|null
  hoveredLandmark: Landmark|null
}

export const defaultState: LocalState = {
  stage: STAGE.ALIGNMENT, // STAGE.SELECTION,
  mode: MODE.DEFAULT,
  addingLandmark: false,
  incLocked: false,
  landmarkPairs: [{
    id: "foo-bar",
    name: "hello my name is",
    incLm: {
      position: [0, 0, 0],
      targetVolumeId: "waxholm"
    },
    tmplLm: {
      position: [0, 0, 0],
      targetVolumeId: "bigbrain"
    }
  }],
  purgatory: null,
  hoveredLandmark: null,
};

export const nameSpace = `app`;
