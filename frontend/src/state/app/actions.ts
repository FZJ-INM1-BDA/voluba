import { createAction, props } from '@ngrx/store';
import { nameSpace, STAGE } from './consts';

export const goToStage = createAction(
  `[${nameSpace}] goToStage`,
  props<{
    stage: STAGE;
  }>()
);

export const toggleIncLocked = createAction(`[${nameSpace}] toggleIncLocked`);
