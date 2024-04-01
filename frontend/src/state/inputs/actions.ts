import { createAction, props } from '@ngrx/store';
import { nameSpace, TVolume } from './consts';

export const selectTemplate = createAction(
  `[${nameSpace}] selecteTemplate`,
  props<Pick<TVolume, 'id'>>()
);

export const selecteIncoming = createAction(
  `[${nameSpace}] selectedIncoming`,
  props<Pick<TVolume, 'id'>>()
);

export const setIncoming = createAction(
  `[${nameSpace}] setIncoming`,
  props<{
    incomingVolumes: TVolume[]
  }>()
)

export const appendUserVolume = createAction(
  `[${nameSpace}] appendUserVolume`,
  props<{
    incomingVolumes: TVolume[]
    referenceVolumes: TVolume[]
  }>()
)
