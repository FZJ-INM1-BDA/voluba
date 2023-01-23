import { createReducer, on } from '@ngrx/store';
import { defaultState } from './consts';
import { goToStage, toggleIncLocked } from './actions';

export const reducer = createReducer(
  defaultState,
  on(goToStage, (state, { stage }) => ({
    ...state,
    stage,
  })),
  on(toggleIncLocked, (state) => ({
    ...state,
    incLocked: !state.incLocked,
  }))
);
