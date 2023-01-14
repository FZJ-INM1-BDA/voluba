import { createAction, props } from "@ngrx/store";
import { nameSpace, TVolume } from "./consts"

export const selectTemplate = createAction(
    `[${nameSpace}] selecteTemplate`,
    props<Pick<TVolume, '@id'>>()
)

export const selecteIncoming = createAction(
    `[${nameSpace}] selectedIncoming`,
    props<Pick<TVolume, '@id'>>()
)
