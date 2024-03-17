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
