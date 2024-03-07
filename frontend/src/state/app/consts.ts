export enum STAGE {
  SELECTION = 'SELECTION',
  ALIGNMENT = 'ALIGNMENT',
}

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
  stage: STAGE;
  incLocked: boolean;
  addingLandmark: boolean;
  landmarkPairs: LandmarkPair[];
  purgatory: Landmark|null;
};

export const defaultState: LocalState = {
  stage: STAGE.ALIGNMENT, // STAGE.SELECTION,
  addingLandmark: false,
  incLocked: false,
  landmarkPairs: [],
  purgatory: null,
};

export const nameSpace = `app`;
