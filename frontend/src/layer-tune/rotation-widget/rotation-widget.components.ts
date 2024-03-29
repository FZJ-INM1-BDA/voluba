import { Component, Input } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";
import { SvgPath } from "./consts";
import { GetClosestFurtherestPipe } from "./pathGetClosestFarthest.pipe";
import { SvgPathToDPipe } from "./pathToD.pipe";

const getXform = (center: number[], quat: export_nehuba.quat, index: 1 | 2 | 3) => {
  const { vec3 } = export_nehuba
  const shuffle = (coord: number[]) => {
    if (index === 1) {
      return coord
    }
    if (index === 2) {
      return coord.slice(0,1).concat(coord.slice(1).reverse())
    }
    if (index === 3) {
      return coord.slice(2).concat(coord.slice(0, 2))
    }
    throw new Error(`Cannot shuffle index ${index}`)
  }
  return (coord: number[]) => {
    const actualCoord = shuffle(coord.map((v, idx) => {
      if (idx < 2) {
        return v - center[idx]
      }
      return v
    }))
    const newV = vec3.fromValues(...actualCoord)
    const disp = vec3.fromValues(...center, 0)
    vec3.transformQuat(newV, newV, quat)
    vec3.add(newV, newV, disp)
    return Array.from(newV)
  }
}

const getGetPath = (center: number[], halfRadius: number, topRow: number, bottomRow: number, leftCol: number, rightCol: number) => {
  return (xform: (coord:number[]) => number[]): SvgPath => {
    return {
      path: [{
        type: 'M',
        coords: [[center[0], topRow, 0]].map(xform)
      },{
        type: 'C',
        coords: [
          [center[0] + halfRadius, topRow , 0],
          [rightCol, topRow + halfRadius, 0],
          [rightCol, center[1], 0]
        ].map(xform)
      },{
        type: 'C',
        coords: [
          [rightCol, center[1] + halfRadius, 0],
          [center[0] + halfRadius, bottomRow, 0],
          [center[0], bottomRow, 0]
        ].map(xform)
      },{
        type: 'C',
        coords: [
          [center[0] - halfRadius, bottomRow, 0],
          [leftCol, center[1] + halfRadius, 0],
          [leftCol, center[1], 0]
        ].map(xform)
      },{
        type: 'C',
        coords: [
          [leftCol, center[1] - halfRadius, 0],
          [center[0] - halfRadius, topRow, 0],
          [center[0], topRow, 0]
        ].map(xform)
      },{
        type: 'z',
        coords: [[]]
      }]
    }
  }
}

@Component({
  selector: 'rotation-widget',
  templateUrl: './rotation-widget.template.html',
  styleUrls: [
    './rotation-widget.style.scss'
  ],
})

export class RotationWidgetCmp {

  #cfPipe = new GetClosestFurtherestPipe()
  #pathToDPipe = new SvgPathToDPipe()

  #quat = new BehaviorSubject<export_nehuba.quat>(export_nehuba.quat.fromValues(0, 0, 0, 1))

  @Input('rotation-widget-rot-quat')
  set _quat(val: export_nehuba.quat) {
    this.#quat.next(val)
  }

  width = 120
  height = 120

  /**
   * margin percent
   * e.g. 0.1
   * === 10% total margin
   * === 5% margin on left and right side respectively
   */
  marginPc = 0.1

  view$ = this.#quat.pipe(
    map(quat => {

      const { width, height, marginPc } = this
      const center = [ width / 2, height / 2 ]
      const radius = (1 - marginPc) * width / 2
      const halfRadius = radius / 2

      const topRow = center[0] - radius
      const bottomRow = center[1] + radius
      
      const leftCol = center[0] - radius
      const rightCol = center[0] + radius

      const blueXform = getXform(center, quat, 1)
      const greenXform = getXform(center, quat, 2)
      const redXform = getXform(center, quat, 3)

      const getPath = getGetPath(center, halfRadius, topRow, bottomRow, leftCol, rightCol)

      const redPath = getPath(redXform)
      const greenPath = getPath(greenXform)
      const bluePath = getPath(blueXform)

      console.log(
        this.#cfPipe.transform(redPath)
      )
      
      return {
        redPath,
        greenPath,
        bluePath,

        strokeWidth: 10,

        widgets: [
          {
            path: redPath,
            color: 'red',
            d: this.#pathToDPipe.transform(redPath),
            cf: this.#cfPipe.transform(redPath),
          },
          {
            path: greenPath,
            color: 'green',
            d: this.#pathToDPipe.transform(greenPath),
            cf: this.#cfPipe.transform(greenPath),
          },
          {
            path: bluePath,
            color: 'blue',
            d: this.#pathToDPipe.transform(bluePath),
            cf: this.#cfPipe.transform(bluePath),
          },
        ]
      }
    })
  )
}
