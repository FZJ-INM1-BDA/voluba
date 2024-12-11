import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, Input, inject } from "@angular/core";
import { BehaviorSubject, Observable, Subject, combineLatest, concat, distinctUntilChanged, filter, map, of, pairwise, startWith, switchMap, takeUntil } from "rxjs";
import { SvgPath } from "./consts";
import { GetClosestFurtherestPipe } from "./pathGetClosestFarthest.pipe";
import { SvgPathToDPipe } from "./pathToD.pipe";
import { DEBOUNCED_WINDOW_RESIZE, FloatArrayEql, isDefined } from "src/const";
import { DestroyDirective } from "src/util/destroy.directive";
import { Store } from "@ngrx/store";
import * as outputs from "src/state/outputs"
import { UndoService } from "src/history/const";

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

const getRelativeXY = (parent: { top: number, left: number, width: number, height: number }, position: { clientX: number, clientY: number }) => {
  const { top, left, width, height } = parent
  const { clientX, clientY } = position
  
  return [
    clientX - left - width / 2,
    clientY - top - height / 2,
  ]
}

@Component({
  selector: 'rotation-widget',
  templateUrl: './rotation-widget.template.html',
  styleUrls: [
    './rotation-widget.style.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    DestroyDirective
  ]
})

export class RotationWidgetCmp {

  destroyed$ = inject(DestroyDirective).destroyed$

  #wMouseUp = new Subject<MouseEvent>()
  @HostListener('window:mouseup', [ '$event' ])
  wMouseUp(event: MouseEvent){
    this.#wMouseUp.next(event)
  }

  
  #wMouseMove = new Subject<MouseEvent>()
  @HostListener('window:mousemove', [ '$event' ])
  wMouseMove(event: MouseEvent){
    this.#wMouseMove.next(event)
  }

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
  
  widgetFillAndDial$ = this.windowResize$.pipe(
    switchMap(() => {
      const { top, left, width, height } = (this.el.nativeElement as HTMLElement).getBoundingClientRect()
      return concat(
        of(null),
        this.#mousedown$.pipe(
          switchMap(mousedown => {
            const { target: { color }, event: mousedownEvent } = mousedown
            return concat(
              of({
                target: { color },
                event: mousedownEvent,
                parent: { top, left, width, height }
              }),
              this.#wMouseMove.pipe(
                takeUntil(this.#wMouseUp),
                map(event => {
                  return {
                    target: { color },
                    event,
                    parent: { top, left, width, height }
                  }
                })
              ),
              of(null)
            )
          })
        )
      )
    })
  )

  view$ = combineLatest([
    this.#quat.pipe(
      distinctUntilChanged(FloatArrayEql)
    ),
    concat(
      of(null),
      this.widgetFillAndDial$,
    ).pipe(
      distinctUntilChanged()
    )
  ]).pipe(
    map(([quat, widget]) => {

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

      let clipPathD: string[]|null = null
      let guidingLineD: string|null = null
      if (!!widget) {
        if (widget.target.color === "red") {
          clipPathD = this.#pathToDPipe.transform(redPath)
        }
        if (widget.target.color === "green") {
          clipPathD = this.#pathToDPipe.transform(greenPath)
        }
        if (widget.target.color === "blue") {
          clipPathD = this.#pathToDPipe.transform(bluePath)
        }
        const newRelativePos = getRelativeXY(widget.parent, widget.event)
        guidingLineD = `M60 60 l ${newRelativePos.map(v => v * 100).join(" ")}`
      }
      
      return {
        redPath,
        greenPath,
        bluePath,

        strokeWidth: 10,

        clipPathD,
        guidingLineD,

        widgets: [
          {
            path: redPath,
            color: 'red',
            d: this.#pathToDPipe.transform(redPath),
            cf: this.#cfPipe.transform(redPath),
            fill: widget?.target.color === "red" ? "red" : "none",
          },
          {
            path: greenPath,
            color: 'green',
            d: this.#pathToDPipe.transform(greenPath),
            cf: this.#cfPipe.transform(greenPath),
            fill: widget?.target.color === "green" ? "green" : "none",
          },
          {
            path: bluePath,
            color: 'blue',
            d: this.#pathToDPipe.transform(bluePath),
            cf: this.#cfPipe.transform(bluePath),
            fill: widget?.target.color === "blue" ? "blue" : "none",
          },
        ]
      }
    })
  )

  #mousedown$ = new Subject<{ target: { color: string }, event: MouseEvent }>()

  handleMouseDown(event: MouseEvent, arg: {color: string}) {
    this.#mousedown$.next({target: arg, event })
  }

  constructor(
    private store: Store,
    private el: ElementRef,
    private undoSvc: UndoService,
    @Inject(DEBOUNCED_WINDOW_RESIZE)
    private windowResize$: Observable<UIEvent>,
  ){

    this.widgetFillAndDial$.pipe(
      pairwise(),
      filter((o, n) => isDefined(o) && isDefined(n)),
      takeUntil(this.destroyed$)
    ).subscribe(([ o, n ]) => {
      if (!o || !n) {
        console.error(`some widget fill and dail not defined. this should not happen`)
        return
      }
      if (o.target.color !== n.target.color) {
        console.error(`target inconsistent, this shouldn't happen`)
        return
      }
      const { quat } = export_nehuba
      const oldXY = getRelativeXY(o.parent, o.event)
      const newXY = getRelativeXY(n.parent, n.event)
      const rot = (Math.atan2(newXY[0], newXY[1]) -  Math.atan2( oldXY[0], oldXY[1] )) * 180 / Math.PI

      const q = quat.fromEuler(
        quat.create(),
        n.target.color === 'red' ? rot * -1 : 0,
        n.target.color === 'green' ? rot : 0,
        n.target.color === 'blue' ? rot : 0,
      )
      
      this.undoSvc.pushUndo(`Rotate via rotation widget ${n.target.color}`)
      
      this.store.dispatch(
        outputs.actions.rotateIncBy({
          text: Array.from(q).join(",")
        })
      )
    })
  }
}
