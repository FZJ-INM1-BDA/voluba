import { createSelector } from "@ngrx/store";
import { nameSpace, LocalState } from "./consts"

const featureSelector = (state: any) => state[nameSpace] as LocalState

export const incomingVolumes = createSelector(
    featureSelector,
    state => state.incomingVolumes
)

export const templateVolumes = createSelector(
    featureSelector,
    state => state.templateVolumes
)

export const selectedTemplate = createSelector(
    featureSelector,
    state => state.selectedTemplate
)

export const selectedIncoming = createSelector(
    featureSelector,
    state => state.selectedIncoming
)
