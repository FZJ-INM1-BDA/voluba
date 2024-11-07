import { createSelector, select } from '@ngrx/store';
import { nameSpace, LocalState } from './consts';
import { Observable, combineLatest, distinctUntilChanged, forkJoin, from, map, of, pipe, switchMap, throwError } from 'rxjs';
import { arrayEqual, canBeConverted, cvtToNm, TVolume, parseGSUrl, ZarrAttrs, ZarrArray } from 'src/const';


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
)

export const centerVoxelPipe = (obs: Observable<any>) => combineLatest([
  incVoxelSize(obs),
  incVoxelExtents(obs),
]).pipe(
  map(([ size, extents ]) => (size || []).map((s, i) => s * (extents || [])[i] / 2)),
  distinctUntilChanged(arrayEqual)
)

export const inputFilesName = createSelector(
  selectedTemplate,
  selectedIncoming,
  (tmp, inc) => `${tmp?.name || 'unknown'}-${inc?.name || 'unknown'}`
)

type IncInfo = Partial<Record<keyof TVolume["volumes"][number]["providers"], any>>

const incInfoPipe = pipe(
  select(selectedIncoming),
  distinctUntilChanged((o, n) => o?.id === n?.id),
  switchMap(incoming => {
    if (!incoming) {
      return of({} as IncInfo)
    }
    if (incoming.volumes.length !== 1) {
      return throwError(() => new Error(`Can only process incoming with one and only one volume. But got ${incoming.volumes.length}`))
    }
    const volume = incoming.volumes[0]
    const precomputedUrl = volume.providers["neuroglancer/precomputed"]
    const n5Url = volume.providers["neuroglancer/n5"]
    const zarrUrl = volume.providers["neuroglancer/zarr"]
    if (!!precomputedUrl) {
      return from(
        fetch(`${precomputedUrl}/info`).then(res => res.json() as Promise<{ scales: { size: number[], resolution: number[] }[] }>)
      ).pipe(
        map(v => {
          return {
            "neuroglancer/precomputed": v
          } as IncInfo
        })
      )
    }
    if (!!n5Url) {
      return forkJoin([
        fetch(
          parseGSUrl(`${n5Url}/attributes.json`)
        ).then(res => res.json() as Promise<{ resolution: number[], units: string[] }>),
        fetch(
          parseGSUrl(`${n5Url}/s0/attributes.json`)
        ).then(res => res.json() as Promise<{ blockSize: number[], dimensions: number[] }>),
      ]).pipe(
        map(([root, s0]) => {
          return {
            "neuroglancer/n5": { root, s0 }
          } as IncInfo
        })
      )
    }
    if (!!zarrUrl) {
      
      return from(
        fetch(parseGSUrl(`${zarrUrl}/.zattrs`)).then(res => res.json() as Promise<ZarrAttrs>)
      ).pipe(
        switchMap(zarrattr => {
          const { multiscales } = zarrattr
          if (multiscales.length !== 1) {
            return throwError(() => new Error(`Can only deal with one dataset, but got ${multiscales.length}`)) 
          }
          const scale = multiscales[0]
          const { axes, datasets } = scale
          if (axes.length !== 3) {
            return throwError(() => new Error(`Can only deal with axes with length 3`))
          }
          for (const { type } of axes){
            if (type !== "space") {
              return throwError(() => new Error(`Can only deal with space axes`))
            }
          }
          if (datasets.length === 0) {
            return throwError(() => new Error(`must have at least one dataset`)) 
          }
          const dataset = datasets[0]
          const { coordinateTransformations, path } = dataset
          if (coordinateTransformations.length !== 1) {
            return throwError(() => new Error(`Can only deal with one coordate transforms, but got ${coordinateTransformations.length}`)) 
          }
          const coordinateTransformation = coordinateTransformations[0]
          const { scale: _scale } = coordinateTransformation

          return from(
            fetch(parseGSUrl(`${zarrUrl}/${path}/.zarray`)).then(res => res.json() as Promise<ZarrArray>)
          ).pipe(
            map(({ shape }) => {
              return {
                "neuroglancer/zarr": {
                  axes,
                  datasets: [
                    {
                      scale: _scale,
                      shape
                    }
                  ]
                }
              } as IncInfo
            })
          )

        })
      )
    }
    return throwError(() => new Error(`volume is neither precomputed nor n5`))
  })
)

export const incVoxelSize = pipe(
  incInfoPipe,
  map(v => {
    if (!v) {
      console.warn(`v does not exist.`)
      return null
    }
    if (!!v["neuroglancer/precomputed"]) {
      const { scales } = v["neuroglancer/precomputed"]
      const { resolution, size } = scales[0] as { resolution: number[], size: number[] }
      return resolution
    }
    if (!!v["neuroglancer/n5"]) {
      const { root } = v["neuroglancer/n5"]
      const { resolution, units } = root as { units: string[], resolution: number[] }
      if (!units || !Array.isArray(units)) {
        console.warn(`n5 parsing warning: units is not an array. Fallback to 1,1,1 nm`)
        return [1, 1, 1]
      }
      return units.map((unit, idx) => {
        if (!resolution[idx]) {
          console.warn(`n5 parsing warning: resolution indexed at ${idx} not found!`)
          return 1
        }
        if (!canBeConverted(unit)) {
          console.warn(`unit ${unit} cannot be converted! Asssuming to be nm instead`)
          return resolution[idx]
        }
        return cvtToNm[unit](resolution[idx])
      })
    }
    if (!!v["neuroglancer/zarr"]) {
      const { datasets, axes } = v["neuroglancer/zarr"]
      const dataset = datasets[0]
      const { scale, shape } = dataset
      return (scale as number[]).map((v, idx: number) => {
        const unit = axes[idx].unit
        if (!(unit in cvtToNm)) {
          console.warn(`${unit} cannot be converted. Using 1 as default`)
          return 1
        }
        return cvtToNm[unit as keyof typeof cvtToNm](v)
      })

    }
    console.warn(`v voxel size cannot be found: ${v}`)
    return null
  })
)

export const incVoxelExtents = pipe(
  incInfoPipe,
  map(v => {
    if (!v) {
      console.warn(`v does not exist.`)
      return null
    }
    if (!!v["neuroglancer/precomputed"]) {
      const { scales } = v["neuroglancer/precomputed"]
      const { resolution, size } = scales[0] as { resolution: number[], size: number[] }
      return size
    }
    if (!!v["neuroglancer/n5"]) {
      const { s0 } = v["neuroglancer/n5"]
      const { dimensions } = s0 as { blockSize: number[], dimensions: number[] }
      return dimensions
    }
    if (!!v["neuroglancer/zarr"]) {
      const { datasets } = v["neuroglancer/zarr"]
      const dataset = datasets[0]
      return dataset.shape as number[]
    }
    console.warn(`voxel extent cannot be found: ${v}`)
    return null
  })
)
