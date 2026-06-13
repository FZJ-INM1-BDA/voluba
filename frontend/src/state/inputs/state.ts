import { defaultState } from './consts'
import { createReducer, on } from '@ngrx/store'
import * as actions from './actions'

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
    incomingVolumes: [
      // do not filter out user added volume
      ...state.incomingVolumes.filter(v => v.visibility === "useradded"),
      ...state.incomingVolumes.filter(v => v.visibility === "bundled"),
      ...incomingVolumes
    ]
  })),
  on(actions.appendUserVolume, (state, { incomingVolumes, referenceVolumes }) => ({
    ...state,
    incomingVolumes: [ ...state.incomingVolumes, ...incomingVolumes ],
    templateVolumes: [ ...state.templateVolumes, ...referenceVolumes ],
  }))
)
