import { createSelector } from '@ngrx/store';
import { nameSpace, LocalState, MODE } from './consts';

const featureSelector = (state: any) => state[nameSpace] as LocalState;

export const stage = createSelector(featureSelector, (state) => state.stage);

export const incLocked = createSelector(
  featureSelector,
  (state) => state.incLocked
);

export const landmarks = createSelector(
  featureSelector,
  state => state.landmarkPairs
)

export const purgatory = createSelector(
  featureSelector,
  state => state.purgatory
)

export const addLmMode = createSelector(
  featureSelector,
  state => state.addingLandmark
)

export const isDefaultMode = createSelector(
  featureSelector,
  state => state.mode === MODE.DEFAULT
)

export const hoveredLandmark = createSelector(
  featureSelector,
  state => state.hoveredLandmark
)

export const hoveredLandmarkPair = createSelector(
  landmarks,
  hoveredLandmark,
  ( landmarks, hoveredLandmark ) => {
    return landmarks.find(lm => lm.incLm === hoveredLandmark || lm.tmplLm === hoveredLandmark)
  }
)

export const user = createSelector(
  featureSelector,
  state => state.user
)
