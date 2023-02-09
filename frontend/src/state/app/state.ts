import { createReducer, on } from '@ngrx/store';
import { defaultState } from './consts';
import * as actions from './actions';

export const reducer = createReducer(
  defaultState,
  on(actions.goToStage, (state, { stage }) => ({
    ...state,
    stage,
  })),
  on(actions.toggleIncLocked, (state) => ({
    ...state,
    incLocked: !state.incLocked,
  })),
  on(actions.addLandmarkPair, (state, { landmarkPair }) => ({
    ...state,
    landmarkPairs: [ ...state.landmarkPairs, landmarkPair ]
  })),
  on(actions.deleteLandmarkPair, (state, { landmarkPair: { id: landmarkId } }) => ({
    ...state,
    landmarkPairs: state.landmarkPairs.filter(({ id }) => id !== landmarkId)
  })),
  on(actions.setAddLandmarkMode, (state, { mode }) => ({
    ...state,
    addingLandmark: mode
  })),
  on(actions.addToPurgatory, (state, { landmark }) => ({
    ...state,
    purgatory: landmark
  })),
  on(actions.purgePurgatory, state => ({
    ...state,
    purgatory: null
  }))
);
