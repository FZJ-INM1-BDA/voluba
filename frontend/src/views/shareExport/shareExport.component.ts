import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { combineLatest, filter, map } from "rxjs";
import { GET_NEHUBA_INJ, GetNehuba, XFORM_FILE_TYPE, transCoordSpcScaling } from "src/const";
import * as inputs from "src/state/inputs"
import * as outputs from "src/state/outputs"

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

@Component({
  selector: 'voluba-share-export',
  templateUrl: './shareExport.template.html',
  styleUrls: [
    './shareExport.style.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ShareExportComponent {

  view$ = combineLatest([
    this.store.pipe(
      select(inputs.selectors.selectedTemplate)
    ),
    this.store.pipe(
      select(inputs.selectors.selectedIncoming)
    ),
    this.store.pipe(
      outputs.selectors.getIncXform()
    )
  ]).pipe(
    filter(args => args.every(v => !!v)),
    map(([ selectedTemplate, selectedIncoming, xform ]) => {

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
      return {
        filename: `${selectedTemplate?.name}-${selectedIncoming?.name}-transform.json`,
        content: JSON.stringify(content, null, 2),
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

        // TODO send warning
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

  constructor(private store: Store, @Inject(GET_NEHUBA_INJ) private getNehuba: GetNehuba){

  }
}