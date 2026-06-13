import { createAction, props } from "@ngrx/store";
import { State } from ".";

const nameSpace = `[main]`

export const error = createAction(
  `[${nameSpace}] error`,
  props<{ message: string }>()
)

export const info = createAction(
  `[${nameSpace}] info`,
  props<{ message: string }>()
)

export const applyState = createAction(
  `[${nameSpace}] applyState`,
  props<{ state: State }>()
)
