import { createSelector, select } from '@ngrx/store';
import { nameSpace, LocalState } from './consts';
import { distinctUntilChanged, from, map, of, pipe, switchMap, throwError } from 'rxjs';

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

export const inputFilesName = createSelector(
  selectedTemplate,
  selectedIncoming,
  (tmp, inc) => `${tmp?.name || 'unknown'}-${inc?.name || 'unknown'}`
)

export const getIncVoxelSize = () => pipe(
  select(selectedIncoming),
  distinctUntilChanged((o, n) => o?.["@id"] === n?.["@id"]),
  switchMap(incoming => {
    if (!incoming) {
      return of(null)
    }
    if (incoming.volumes.length !== 1) {
      return throwError(() => new Error(`Can only process incoming with one and only one volume. But got ${incoming.volumes.length}`))
    }
    const volume = incoming.volumes[0]
    const precomputedUrl = volume.providers["neuroglancer/precomputed"]
    
    return from(
      fetch(`${precomputedUrl}/info`).then(res => res.json())
    ).pipe(
      map(v => {
        return v?.scales?.[0]?.resolution as number[]|undefined
      })
    )
  })
)
