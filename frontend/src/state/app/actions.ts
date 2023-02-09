import { createAction, props } from '@ngrx/store';
import { nameSpace, STAGE, LandmarkPair, Landmark } from './consts';

export const goToStage = createAction(
  `[${nameSpace}] goToStage`,
  props<{
    stage: STAGE;
  }>()
);

export const toggleIncLocked = createAction(`[${nameSpace}] toggleIncLocked`);

export const addLandmarkPair = createAction(
  `[${nameSpace}] addLandmarkPair`,
  props<{
    landmarkPair: LandmarkPair
  }>()
)

export const deleteLandmarkPair = createAction(
  `[${nameSpace}] deleteLandmarkPair`,
  props<{
    landmarkPair: { id: string }
  }>()
)

export const addLandmark = createAction(
  `[${nameSpace}] addLandmark`,
  props<{
    landmark: Landmark
  }>()
)

export const addToPurgatory = createAction(
  `[${nameSpace}] addPurgatory`,
  props<{
    landmark: Landmark
  }>()
)

export const purgePurgatory = createAction(
  `[${nameSpace}] purgePurgatory`
)

export const error = createAction(
  `[${nameSpace}] error`,
  props<{
    message: string
  }>()
)

export const setAddLandmarkMode = createAction(
  `[${nameSpace}] setAddLandmarkMode`,
  props<{
    mode: boolean
  }>()
)
