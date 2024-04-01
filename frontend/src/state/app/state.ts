import { createReducer, on } from '@ngrx/store';
import { defaultState, LandmarkPair, MODE } from './consts';
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
  })),
  on(actions.toggleMode, state => ({
    ...state,
    mode: (state.mode === MODE.DEFAULT)
    ? MODE.SIDE_BY_SIDE
    : MODE.DEFAULT
  })),
  on(actions.updateLandmarkPair, (state, { id, value }) => {
    const updatedLmps: LandmarkPair[] = []

    for (const lmp of state.landmarkPairs) {
      if (lmp.id !== id) {
        updatedLmps.push(lmp)
        continue
      }

      updatedLmps.push({
        ...lmp,
        ...value        
      })
    }

    return {
      ...state,
      landmarkPairs: updatedLmps,
    }
  }),
  on(actions.hoverLandmark, (state, { landmark }) => {
    return {
      ...state,
      hoveredLandmark: landmark
    }
  }),
  on(actions.setUser, (state, { user }) => ({
    ...state,
    user: {
      fullname: user.name,
      authtoken: user.accessToken,
    }
  }))
)
