import { createAction, props } from "@ngrx/store";
import { nameSpace, MatrixInput, Vec3Input, QuatInput } from "./consts"

export const setIncMatrix = createAction(
  `[${nameSpace}] setIncMatrix`,
  props<MatrixInput>()
)

export const setIncTranslation = createAction(
  `[${nameSpace}] setIncTranslation`,
  props<Vec3Input>()
)

export const setIncTranslationX = createAction(
  `[${nameSpace}] setIncTranslationX`,
  props<{ value: number }>()
)

export const setIncTranslationY = createAction(
  `[${nameSpace}] setIncTranslationY`,
  props<{ value: number }>()
)

export const setIncTranslationZ = createAction(
  `[${nameSpace}] setIncTranslationZ`,
  props<{ value: number }>()
)

export const setIncScaleX = createAction(
  `[${nameSpace}] setIncScaleX`,
  props<{ value: number }>()
)

export const setIncScaleY = createAction(
  `[${nameSpace}] setIncScaleY`,
  props<{ value: number }>()
)

export const setIncScaleZ = createAction(
  `[${nameSpace}] setIncScaleZ`,
  props<{ value: number }>()
)

export const rotateIncBy = createAction(
  `[${nameSpace}] rotateIncBy`,
  props<QuatInput>()
)

export const dry = createAction(
  `[${nameSpace}] dry`,
)
