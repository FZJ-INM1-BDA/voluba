import { createAction, props } from "@ngrx/store";

const nameSpace = `[main]`

export const error = createAction(
  `[${nameSpace}] error`,
  props<{ message: string }>()
)
