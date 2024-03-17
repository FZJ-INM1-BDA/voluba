
export const STAGE = {
  SELECTION: 'SELECTION',
  ALIGNMENT: 'ALIGNMENT',
} as const

export const MODE = {
  DEFAULT: "DEFAULT",
  SIDE_BY_SIDE: "SIDE_BY_SIDE",
} as const

type Vec3 = [number, number, number];
type Color = string;

export type Landmark = {
  targetVolumeId: string;
  position: Vec3;
};

export type LandmarkPair = {
  tmplLm: Landmark;
  incLm: Landmark;
  color: Color;
  id: string;
  name: string;
};

export type LocalState = {
  stage: keyof typeof STAGE;
  mode: keyof typeof MODE;
  incLocked: boolean;
  addingLandmark: boolean;
  landmarkPairs: LandmarkPair[];
  purgatory: Landmark|null;
};

export const defaultState: LocalState = {
  stage: STAGE.ALIGNMENT, // STAGE.SELECTION,
  mode: MODE.DEFAULT,
  addingLandmark: false,
  incLocked: false,
  landmarkPairs: [],
  purgatory: null,
};

export const nameSpace = `app`;
