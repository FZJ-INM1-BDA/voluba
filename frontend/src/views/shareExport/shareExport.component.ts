import { ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { BehaviorSubject, EMPTY, combineLatest, distinctUntilChanged, finalize, firstValueFrom, from, interval, map, scan, switchMap, takeUntil, takeWhile } from "rxjs";
import { EbrainsPublishResult, EbrainsWorkflowPollResponse, GET_NEHUBA_INJ, GetNehuba, REFERENCE_ID_TO_SXPLR_ROOT, VOLUBA_APP_CONFIG, VolubaAppConfig, XFORM_FILE_TYPE, getNgLayer, getNgUrl, transCoordSpcScaling } from "src/const";
import * as inputs from "src/state/inputs"
import * as outputs from "src/state/outputs"
import * as appState from "src/state/app"
import * as generalActions from "src/state/actions"
import { DestroyDirective } from "src/util/destroy.directive";

const flattenMat = (arr: number[][]) => arr.reduce((acc, curr) => acc.concat(curr), [])

function convertNmToVoxel(ngCoordinateSpace: Record<string, export_nehuba.Dimension>, input:number[]) {
  
  const cvt = {
    "km": 1e12,
    "m": 1e9,
    "mm": 1e6,
    "µm": 1e3,
    "nm": 1,
    'pm': 1e-3,
  }
  const { x, y, z } = ngCoordinateSpace || {}
  if (!x || !y || !z) {
    throw new Error(`neuroglancer coordinateSpace not defined!`)
  }
  for (const [ _, unit ] of [x, y, z]) {
    if (!(unit in cvt)) {
      throw new Error(`Unit ${unit} not in ${JSON.stringify(cvt)}`)
    }
  }
  return [x, y, z].map(([value, unit], idx) => input[idx] / cvt[unit] / value)
}

function convertVoxelToNm(ngCoordinateSpace: Record<string, export_nehuba.Dimension>, input:number[]){

  const cvt = {
    "km": 1e12,
    "m": 1e9,
    "mm": 1e6,
    "µm": 1e3,
    "nm": 1,
    'pm': 1e-3,
  }
  const { x, y, z } = ngCoordinateSpace || {}
  if (!x || !y || !z) {
    throw new Error(`neuroglancer coordinateSpace not defined!`)
  }
  for (const [ _, unit ] of [x, y, z]) {
    if (!(unit in cvt)) {
      throw new Error(`Unit ${unit} not in ${JSON.stringify(cvt)}`)
    }
  }
  return [x, y, z].map(([value, unit], idx) => input[idx] * cvt[unit] * value)
}

@Component({
  selector: 'voluba-share-export',
  templateUrl: './shareExport.template.html',
  styleUrls: [
    './shareExport.style.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    DestroyDirective,
  ]
})

export class ShareExportComponent {

  destroyed$ = inject(DestroyDirective).destroyed$

  @ViewChild('description', { read: ElementRef })
  descInput: ElementRef|undefined

  #publishProgress$ = new BehaviorSubject<Partial<{
    id?: string
    sending?: boolean
    polling?: boolean
    stages: EbrainsPublishResult[]
    error?: string
  }>>({
    stages: []
  })

  view$ = combineLatest([
    this.store.pipe(
      select(inputs.selectors.selectedTemplate)
    ),
    this.store.pipe(
      select(inputs.selectors.selectedIncoming)
    ),
    this.store.pipe(
      outputs.selectors.getIncXform()
    ),
    this.store.pipe(
      select(appState.selectors.user)
    ),
    this.#publishProgress$.pipe(
      scan((acc, curr) => {
        return {
          ...acc,
          ...curr,
        }
      })
    )
  ]).pipe(
    map(([
      selectedTemplate,
      selectedIncoming,
      xform,
      user,
      {
        id: publishId,
        polling: publishPolling,
        sending: publishSending,
        stages: publishStages
      }
    ]) => {

      const nehuba = this.getNehuba.getNehubaInstance()
      const coordinateSpace = nehuba && nehuba.ngviewer.coordinateSpace.toJSON()
      const content: outputs.consts.ExportJson = {
        "@type": XFORM_FILE_TYPE,
        version: '1.02',
        contentHash: selectedIncoming?.contentHash || 'Unknown hash',
        incomingVolume: selectedIncoming?.name || 'Unknown incoming',
        referenceVolume: selectedTemplate?.name || 'Unknown reference',
        coordinateSpace,
        transform: Array.from(xform),
      }

      const { mat4 } = export_nehuba
      const _ = Array.from(mat4.transpose(mat4.create(), xform))
      const canonicalTransform = [
        _.slice(0, 4),
        _.slice(4, 8),
        _.slice(8, 12),
        _.slice(12, 16)
      ]

      const openInSxplr: string|null = (() => {
        if (
          !selectedIncoming
          || !selectedTemplate
          || selectedTemplate.visibility === "useradded"
        ) {
          return null
        }
        const rootPath = REFERENCE_ID_TO_SXPLR_ROOT[selectedTemplate.id]
        if (!rootPath) {
          return null
        }
        
        
        const { sxplrhost } = this.appCfg
        let url = `${sxplrhost}/#${rootPath}`
        
        const { origin, pathname } = window.location
        const pluginUrl = new URL(`${origin}${pathname.replace(/\/$/, '')}/viewerPlugin/template.html`)
        const incomingUrl = getNgLayer(selectedIncoming)
        pluginUrl.searchParams.set("precomputed", incomingUrl)
        
        const nehuba = this.getNehuba.getNehubaInstance()
        const coordinateSpace = nehuba?.ngviewer.coordinateSpace.toJSON()
        if (!coordinateSpace) {
          console.error(`coordinateSpace not defined!`)
          return null
        }
        const xformArray = Array.from(xform)
        const nm = convertVoxelToNm(coordinateSpace, xformArray.slice(12, 15))
        xformArray[12] = nm[0]
        xformArray[13] = nm[1]
        xformArray[14] = nm[2]
        
        const transform = [0,1,2].map(r => [0,1,2,3].map(c => xformArray[ c * 4 + r ])).reduce((acc, curr) => [...acc, ...curr], []).join(",")

        pluginUrl.searchParams.set(
          "transform", 
          transform
        )
  
        const pluginUrlString = pluginUrl.toString()
        
        url += `?pl=${encodeURIComponent(JSON.stringify([pluginUrlString]))}`
        return url
      })()

      return {
        openInSxplr,

        // export json
        filename: `${selectedTemplate?.name}-${selectedIncoming?.name}-transform.json`,
        content: JSON.stringify(content, null, 2),

        // publish
        user,
        incomingVolume: selectedIncoming,
        referenceVolume: selectedTemplate,
        canonicalTransform,
        canonicalTransformText: "[\n" + canonicalTransform.map(row => "  " + JSON.stringify(row)).join(",\n") + "\n]",

        // publish workflow
        publishId,
        publishBusy: publishPolling || publishSending,
        publishStages,
      }
    })
  )

  #validateXform(input: any){
    if (input['@type'] !== XFORM_FILE_TYPE) {
      throw new Error(`Expected @type property to be ${XFORM_FILE_TYPE}, but was ${input['@type']} instead`)
    }
    const nehuba = this.getNehuba.getNehubaInstance()
    const coordinateSpace = nehuba?.ngviewer.coordinateSpace.toJSON()
    if (!coordinateSpace) {
      throw new Error(`nehubaViewer not yet provided`)
    }
    
    const { mat4 } = export_nehuba

    let matrix: number[]
    const { version, transformMatrixInNm, transform, coordinateSpace: jsonCoordinateSpace, referenceVolume, incomingVolume } = input as outputs.consts.ExportJson & {transformMatrixInNm: any}
    
    switch (version) {
      case 1:
      case 1.01: {

        const { x, y, z } = coordinateSpace
  
        const xformMat = mat4.fromValues(...flattenMat(transformMatrixInNm))
        mat4.transpose(xformMat, xformMat)
        matrix = Array.from(xformMat)
        const [nx, ny, nz] = convertNmToVoxel(coordinateSpace, matrix.slice(12,15))
        matrix[12] = nx
        matrix[13] = ny
        matrix[14] = nz

        this.store.dispatch(
          generalActions.info({
            message: `You supplied a transform json with version number < v1.02. This version of transform is quite unstable, and is prone to breakage. Please consider generate newer versions.`
          })
        )
        break
      }
      case 1.02:
      case '1.02': {
        if (!jsonCoordinateSpace) {
          throw new Error(`coordinateSpace key in json must be defined.`)
        }
        const scaling = transCoordSpcScaling(coordinateSpace, jsonCoordinateSpace)
        const { mat4, vec3 } = export_nehuba
        
        const xformMat = mat4.fromValues(...transform)

        /**
         * Firstly undo the translation
         */
        const transl = mat4.getTranslation(vec3.create(), xformMat) as export_nehuba.vec3
        const undoTransl = vec3.scale(vec3.create(), transl, -1)
        const undoTranslMat = mat4.fromTranslation(mat4.create(), undoTransl)

        /**
         * now scale and apply the correct translation
         */
        vec3.mul(transl, transl, scaling)
        const correctTranslMat = mat4.fromTranslation(mat4.create(), transl)

        /**
         * undo transl and apply the correct transl
         */
        mat4.mul(xformMat, undoTranslMat, xformMat)
        mat4.mul(xformMat, correctTranslMat, xformMat)

        matrix = Array.from(xformMat)
        break
      }
      default: {
        throw new Error(`Expected version to be 1, 1.01, 1.02, but was ${version} instead`)
      }
    }
    return matrix
  }
  
  handleLoadedXform(content: string){
    const parsedJson = JSON.parse(content)
    const matrix = this.#validateXform(parsedJson)
    this.store.dispatch(
      outputs.actions.setIncMatrix({
        text: matrix.join(",")
      })
    )
  }

  async publish(){
    const { content } = await firstValueFrom(this.view$)
    const description = (this.descInput?.nativeElement as HTMLTextAreaElement).value || ''
    this.#publishProgress$.next({
      sending: true
    })
    try{
      const res = await fetch(`ebrains`, {
        method: "POST",
        body: JSON.stringify({
          ...JSON.parse(content),
          description
        }),
        headers: {
          "content-type": "applicaton/json"
        }
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      const { job_id } = await res.json()
      this.#publishProgress$.next({
        id: job_id
      })
    } catch (e: any) {
      this.#publishProgress$.next({
        error: e.toString()
      })
    } finally {
      this.#publishProgress$.next({
        sending: false,
      })
    }
  }

  async #poll(id: string) {
    const res = await fetch(`ebrains/${id}`)
    if (!res.ok) {
      throw new Error(await res.text() || res.status.toString())
    }
    const result: EbrainsWorkflowPollResponse = await res.json()
    return result
  }

  constructor(
    private store: Store,
    @Inject(GET_NEHUBA_INJ)
    private getNehuba: GetNehuba,
    @Inject(VOLUBA_APP_CONFIG)
    private appCfg: VolubaAppConfig
  ){
    let flag = true
    this.#publishProgress$.pipe(
      takeUntil(this.destroyed$),
      map(({ id }) => id),
      distinctUntilChanged(),
      switchMap(id => {
        if (!id || flag) {
          return EMPTY
        }
        return interval(1000).pipe(
          takeUntil(this.destroyed$),
          switchMap(() => from(this.#poll(id))),
          takeWhile(val =>
            val.progresses.some(
              ({ status }) => !(status === "COMPLETED" || status === "ERROR")
            ),
            true // emit the first instance where all either completed or errored
          ),
          finalize(() => {
            this.#publishProgress$.next({
              id: undefined
            })
          })
        )
      })
    ).subscribe(({ progresses }) => {
      this.#publishProgress$.next({
        stages: progresses
      })
    })
  }
}
