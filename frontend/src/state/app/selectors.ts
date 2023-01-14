import { createSelector } from "@ngrx/store"
import { nameSpace, LocalState } from "./consts"

const featureSelector = (state: any) => state[nameSpace] as LocalState

export const stage = createSelector(
    featureSelector,
    state => state.stage
)

export const incLocked = createSelector(
    featureSelector,
    state => state.incLocked
)
