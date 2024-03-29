import { defaultState } from './consts';
import { createReducer, on } from '@ngrx/store';
import * as actions from './actions';

export const reducer = createReducer(
  defaultState,
  on(actions.selectTemplate, (state, { id: selectId }) => ({
    ...state,
    selectedTemplate:
      state.templateVolumes.find(({ id }) => id === selectId) || null,
  })),
  on(actions.selecteIncoming, (state, { id: selectId }) => ({
    ...state,
    selectedIncoming:
      state.incomingVolumes.find(({ id }) => id === selectId) || null,
  })),
  on(actions.setIncoming, (state, { incomingVolumes }) => ({
    ...state,
    incomingVolumes
  }))
)
