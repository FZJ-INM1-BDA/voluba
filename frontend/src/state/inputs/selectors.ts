import { createSelector } from '@ngrx/store';
import { nameSpace, LocalState } from './consts';

const featureSelector = (state: any) => state[nameSpace] as LocalState;

export const incomingVolumes = createSelector(
  featureSelector,
  (state) => state.incomingVolumes
);

export const templateVolumes = createSelector(
  featureSelector,
  (state) => state.templateVolumes
);

export const selectedTemplate = createSelector(
  featureSelector,
  (state) => state.selectedTemplate
);

export const selectedIncoming = createSelector(
  featureSelector,
  (state) => state.selectedIncoming
);

export const centerVoxel = createSelector(
  featureSelector,
  (state) => {
    if (!state.selectedIncoming) {
      return null
    }
    const { vec3 } = export_nehuba;
    const dim = vec3.fromValues(...state.selectedIncoming.dim)
    return vec3.scale(dim, dim, 0.5)
  }
)