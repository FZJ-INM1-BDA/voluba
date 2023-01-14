import { createSelector } from "@ngrx/store"
import { LocalState, nameSpace } from "./consts"

const featureSelector = (state: any) => state[nameSpace] as LocalState

export const incMatrixMat4 = createSelector(
  featureSelector,
  state => {
    const { mat4 } = export_nehuba
    return mat4.fromValues(...state.transformStr.split(',').map(v => Number(v)))
  }
)

export const flippedState = createSelector(
  featureSelector,
  state => {
    const { vec3 } = export_nehuba
    return vec3.fromValues(...state.flippedState.split(",").map(v => Number(v)))
  }
)
