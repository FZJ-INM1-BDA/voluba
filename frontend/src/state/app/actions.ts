import { createAction, props } from '@ngrx/store';
import { nameSpace, STAGE, LandmarkPair, Landmark } from './consts';

export const goToStage = createAction(
  `[${nameSpace}] goToStage`,
  props<{
    stage: keyof typeof STAGE;
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

export const toggleMode = createAction(
  `[${nameSpace}] toggleMode`
)

export const updateLandmarkPair = createAction(
  `[${nameSpace}] updatelandmarkpair`,
  props<{
    id: string
    value: Partial<Omit<LandmarkPair, 'id'>>
  }>()
)
