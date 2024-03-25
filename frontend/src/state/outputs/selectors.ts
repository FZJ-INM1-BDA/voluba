import { distinctUntilChanged, map, pipe } from "rxjs"
import { createSelector, select } from '@ngrx/store';
import { LocalState, nameSpace } from './consts';

const featureSelector = (state: any) => state[nameSpace] as LocalState;

const incMatStrSel = createSelector(
  featureSelector,
  state => state.transformStr
)

export const getIncXform = () => pipe(
  select(incMatStrSel),
  distinctUntilChanged(),
  map(incXformStr => {
    const { mat4 } = export_nehuba;
    return mat4.fromValues(
      ...incXformStr.split(',').map((v) => Number(v))
    );
  })
)

export const incMatrixMat4 = createSelector(featureSelector, (state) => {
  const { mat4 } = export_nehuba;
  return mat4.fromValues(
    ...state.transformStr.split(',').map((v) => Number(v))
  );
});

const flippedStateStr = createSelector(
  featureSelector,
  state => state.flippedState
)

export const getFlippedState = () => pipe (
  select(flippedStateStr),
  distinctUntilChanged(),
  map(str => {
    const { vec3 } = export_nehuba
    return vec3.fromValues(
      ...str.split(",").map(v => Number(v))
    )
  })
)
