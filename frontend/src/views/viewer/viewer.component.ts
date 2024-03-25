import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injectable,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  combineLatest,
  map,
  filter,
  Observable,
  switchMap,
  withLatestFrom,
  Subject,
  takeUntil,
  NEVER,
  concat,
  of,
  BehaviorSubject,
  firstValueFrom,
  merge,
} from 'rxjs';
import { MouseInteractionDirective } from 'src/mouse-interactions/mouse-interaction.directive';
import * as outputs from 'src/state/outputs';
import * as appState from "src/state/app"
import * as inputs from 'src/state/inputs';
import { NehubaNavigation, NehubaViewerWrapperComponent } from '../nehuba-viewer-wrapper/nehuba-viewer-wrapper.component';
import { Mat4, OverlayLm, VOLUBA_NEHUBA_TOKEN } from 'src/const';
import { INCOMING_LM_COLOR, Landmark, LandmarkPair, REF_LM_COLOR } from 'src/landmarks/const';
import { Actions, ofType } from '@ngrx/effects';


const REF_VOL_ID = 'reference-volume'
const INC_VOL_ID = 'incoming-volume'

const _BIGBRAIN_NEHUBA_LAYER = {
  id: REF_VOL_ID,
  url: 'precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/8bit' && 'precomputed://http://127.0.0.1:8080/sharded/BigBrainRelease.2015/8bit',
  transform: [
    [1, 0, 0, -70677184],
    [0, 1, 0, -70010000],
    [0, 0, 1, -58788284],
    [0, 0, 0, 1],
  ] as Mat4,
}

const _INC_LAYER = {
  id: INC_VOL_ID,
  url: 'precomputed://https://neuroglancer.humanbrainproject.eu/precomputed/JuBrain/v2.2c/colin27_seg' && 'precomputed://http://127.0.0.1:8080/sharded/WHS_SD_rat/templates/v1.01/t2star_masked/',
  transform: [
    [1.0, 0.0, 0.0, 0],
    [0.0, 1.0, 0.0, 0],
    [0.0, 0.0, 1.0, 0],
    [0.0, 0.0, 0.0, 1.0],
  ] as Mat4,
}


@Injectable()
class NehubaSvc {
  #mouseover = new Subject<Float32Array>()
  #mousedown = new Subject<MouseEvent>()
  #mouseup = new Subject<MouseEvent>()

  mouseover = this.#mouseover.asObservable()
  mousedown = this.#mousedown.asObservable()
  mouseup = this.#mouseup.asObservable()

  setMouseOver(val: Float32Array){
    this.#mouseover.next(val)
  }
  setMouseDown(ev: MouseEvent) {
    this.#mousedown.next(ev)
  }
  setMouseUp(ev: MouseEvent) {
    this.#mouseup.next(ev)
  }
}

class LandmarkSvc {
  static REF_LM_COLOR = "#ffffff"
  static INCOMING_LM_COLOR = "#ffff00"

  static GetXformToOverlay(xform: export_nehuba.mat4, hoveredLMP: LandmarkPair|undefined|null) {
    const { vec3 } = export_nehuba
    return {
      getReference: function(landmark: LandmarkPair): OverlayLm {
        return {
          ...landmark.tmplLm,
          color: LandmarkSvc.REF_LM_COLOR,
          id: `${landmark.id}-ref`,
          highlighted: hoveredLMP?.id === landmark.id,
        }
      },
      getIncoming: function(landmark: LandmarkPair): OverlayLm {
      
        const newPos = vec3.fromValues(...landmark.incLm.position)
        vec3.transformMat4(newPos, newPos, xform)
        return {
          ...landmark.incLm,
          color: LandmarkSvc.INCOMING_LM_COLOR,
          position: Array.from(newPos),
          id: `${landmark.id}-inc`,
          highlighted: hoveredLMP?.id === landmark.id,
        }
      }
    }
  }

  static TranslateOverlayLmToLm(landmarks: LandmarkPair[], overlayLm: OverlayLm): {
    landmarkPair: LandmarkPair
    landmark: Landmark
  } | null {
    let searchId: string|null = null
    let key: 'tmplLm'|'incLm'|undefined
    if (overlayLm.id.endsWith("-inc")) {
      searchId = overlayLm.id.replace(/-inc$/, '')
      key = 'incLm'
    }
    if (overlayLm.id.endsWith("-ref")) {
      searchId = overlayLm.id.replace(/-ref$/, '')
      key = 'tmplLm'
    }
    const foundLmp = searchId && landmarks.find(lm => lm.id === searchId)
    if (!foundLmp){
      return null
    }
    return {
      landmarkPair: foundLmp,
      landmark: foundLmp[key!]
    }
  }
}

@Component({
  selector: 'voluba-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    NehubaSvc,
    {
      provide: VOLUBA_NEHUBA_TOKEN,
      useFactory: (svc: NehubaSvc) => {
        return svc
      },
      deps: [ NehubaSvc ]
    }
  ],
  hostDirectives: [
    MouseInteractionDirective,
  ]
})
export class ViewerComponent implements AfterViewInit {

  
  selfMouseEv = inject(MouseInteractionDirective)
  #destroyed$ = inject(MouseInteractionDirective).destroyed$

  @ViewChild(NehubaViewerWrapperComponent)
  viewerWrapper: NehubaViewerWrapperComponent | undefined

  @ViewChildren(NehubaViewerWrapperComponent)
  viewerWrappers: QueryList<NehubaViewerWrapperComponent> | undefined

  @ViewChild(MouseInteractionDirective)
  mouseInteractive: MouseInteractionDirective | undefined

  public incLocked$ = this.store.pipe(select(appState.selectors.incLocked))

  #primaryNehubaNav = new BehaviorSubject<NehubaNavigation>({
    orientation: new Float32Array([0, 0, 0, 1]),
    position: new Float32Array([0, 0, 0]),
    zoom: 1e5,
  })

  setPrimaryNav(nav: NehubaNavigation){
    this.#primaryNehubaNav.next(nav)
  }

  lmView$ = combineLatest([
    this.store.pipe(
      select(appState.selectors.landmarks)
    ),
    this.store.pipe(
      select(appState.selectors.addLmMode)
    ),
    this.store.pipe(
      select(appState.selectors.hoveredLandmarkPair),
    ),
    this.store.pipe(
      select(appState.selectors.purgatory)
    ),
  ]).pipe(
    map(([ landmarks, addLandmarkMode, hoveredLmp, purgatory ]) => {
      return {
        landmarks, addLandmarkMode, hoveredLmp, purgatory
      }
    })
  )

  view$ = combineLatest([
    
    this.lmView$,
    this.incLocked$,
    this.store.pipe(
      select(appState.selectors.isDefaultMode)
    ),
    this.store.pipe(outputs.selectors.getIncXform()),
    concat(
      of(null),
      this.nehubaSvc.mouseover,
    ),
    this.#primaryNehubaNav,
    concat(
      of(false),
      merge(
        this.selfMouseEv.mousedown.pipe(
          map(() => true)
        ),
        this.selfMouseEv.mouseup.pipe(
          map(() => false)
        )
      )
    )
  ]).pipe(
    map(([ { landmarks, addLandmarkMode, hoveredLmp, purgatory }, incLocked, isDefaultMode, xform, mouseover, primaryNavigation, isDraggingViewer ]) => {
      
      const { mat4 } = export_nehuba

      const { getIncoming, getReference } = LandmarkSvc.GetXformToOverlay(xform, hoveredLmp)
      const storedLandmarks = landmarks.map(lm => {
        const incomingLandmarks: OverlayLm[] = []
        if (isDefaultMode) {
          incomingLandmarks.push(getIncoming(lm))
        }
        return [
          getReference(lm),
          ...incomingLandmarks
        ]
      })
      const purgatoryLandmarks: OverlayLm[] = []
      if (purgatory) {
        purgatoryLandmarks.push({
          ...purgatory,
          color: REF_LM_COLOR,
          id: 'purgatory'
        })
      }
      if (addLandmarkMode && mouseover) {
        purgatoryLandmarks.push({
          id: 'purgatory',
          targetVolumeId: 'purgatory',
          position: Array.from(mouseover) as [number, number, number],
          color: purgatory
          ? INCOMING_LM_COLOR
          : REF_LM_COLOR
        })
      }

      const secondaryLandmarks: OverlayLm[] = []

      if (!isDefaultMode) {
        secondaryLandmarks.push(
          ...landmarks.map(lm => {
            return getIncoming(lm)
          })
        )

        if (addLandmarkMode && mouseover && purgatory) {
          secondaryLandmarks.push({
            id: 'purgatory',
            targetVolumeId: 'purgatory',
            position: Array.from(mouseover),
            color: INCOMING_LM_COLOR
          })
        }
      }
      

      const tXform = mat4.transpose(mat4.create(), xform)
      const atXform = Array.from(tXform)

      return { 
        incLocked,
        isDefaultMode,
        primaryLandmarks: [
          ...storedLandmarks.flatMap(v => v),
          ...purgatoryLandmarks
        ],
        secondaryLandmarks,
        showAddingRefLmOverlay: !isDefaultMode && addLandmarkMode && !purgatory,
        showAddingIncLmOverlay: !isDefaultMode && addLandmarkMode && purgatory,
        primaryLayers: [ _BIGBRAIN_NEHUBA_LAYER, _INC_LAYER ],
        secondaryLayers: [ {
          ..._INC_LAYER,
          transform: [
            atXform.slice(0, 4),
            atXform.slice(4, 8),
            atXform.slice(8, 12),
            atXform.slice(12, 16),
          ] as Mat4
        }],
        primaryNavigation,
        isDraggingViewer,
        addLandmarkMode,
      }
    })
  );

  toggleIncLocked() {
    this.store.dispatch(appState.actions.toggleIncLocked());
  }

  toggleMode() {
    this.store.dispatch(appState.actions.toggleMode())
  }

  constructor(
    private store: Store,
    private nehubaSvc: NehubaSvc,
    private actions$: Actions
  ) {}

  onMousePosition(pos: Float32Array){
    this.nehubaSvc.setMouseOver(pos)
  }

  onMouseDown(ev: MouseEvent) {
    this.nehubaSvc.setMouseDown(ev)
  }

  onMouseUp(ev: MouseEvent) {
    this.nehubaSvc.setMouseUp(ev)
  }

  ngAfterViewInit(): void {
    if (!this.mouseInteractive) {
      throw new Error(`Cannot find mouse interactive directive`);
    }
    if (!this.viewerWrapper) {
      throw new Error(`Cannot find viewer wrapper module`);
    }

    const dragOnIncVol$: Observable<{
      movementX: number;
      movementY: number;
      sliceView: export_nehuba.SliceView;
      mouseDownEvent: MouseEvent;
    } | null> = this.viewerWrapper.mousedownSliceView.pipe(
      switchMap(({ sliceView, event }) => {
        if (!sliceView || !this.mouseInteractive) {
          return NEVER
        }
        return combineLatest([
          this.incLocked$,
          this.store.pipe(
            select(appState.selectors.isDefaultMode)
          ),
          this.store.pipe(
            select(appState.selectors.addLmMode)
          ),
          this.mouseInteractive.volubaDrag,
          
        ]).pipe(
          filter(([incLocked, isDefaultMode, isAddingLm, _]) => !incLocked && !isAddingLm && isDefaultMode),
          map(([_, _2, _3, { movementX, movementY }]) => ({
            movementX,
            movementY,
            sliceView,
            mouseDownEvent: event,
          }))
        )
      })
    )

    dragOnIncVol$.pipe(
      filter((v) => !!v && !v.mouseDownEvent.shiftKey),
      withLatestFrom(this.store.pipe(select(outputs.selectors.incMatrixMat4))),
      takeUntil(this.#destroyed$),
    ).subscribe(([val, xformMat]) => {
      if (!val) return;
      const { movementX, movementY, sliceView } = val;

      const { vec3, mat4 } = export_nehuba;

      const pos = vec3.fromValues(movementX, movementY, 0);

      vec3.transformMat4(pos, pos, sliceView.invViewMatrix);
      vec3.sub(pos, pos, sliceView.centerDataPosition);

      const prevTranslVec = mat4.getTranslation(vec3.create(), xformMat);
      /**
       * add delta & set xformMat
       */
      vec3.add(pos, pos, prevTranslVec);

      this.store.dispatch(
        outputs.actions.setIncTranslation({
          array: Array.from(pos),
        })
      )
    })

    dragOnIncVol$.pipe(
      filter((v) => !!v && v.mouseDownEvent.shiftKey),
      takeUntil(this.#destroyed$),
    ).subscribe((val) => {
      if (!val) return;

      const { vec3, quat } = export_nehuba;
      const { movementX, movementY, sliceView } = val;
      const { orientation } = sliceView.navigationState.pose.orientation;

      /**
       * TODO
       * fix the rotation
       * couldn't get the angle right
       */
      const axes0 = vec3.fromValues(0, -1, 0);
      const axes1 = vec3.fromValues(1, 0, 0);
      /**
       * 0 0 1
       * 1 0 0
       * 
       * -1 0 0
       * 0 0 -1
       * 
       * 0 -1 0
       * 1 0 0 
       */

      vec3.transformQuat(axes0, axes0, orientation);
      vec3.transformQuat(axes1, axes1, orientation);

      /**
       * TODO add viewer rotation state
       */

      const finalRotation = quat.create();

      quat.mul(
        finalRotation,
        quat.setAxisAngle(quat.create(), axes0, (-movementX * Math.PI) / 180),
        quat.setAxisAngle(quat.create(), axes1, (movementY * Math.PI) / 180)
      );

      this.store.dispatch(
        outputs.actions.rotateIncBy({
          array: Array.from(finalRotation),
        })
      );
    })


    this.store.pipe(
      outputs.selectors.getIncXform(),
      takeUntil(this.#destroyed$),
    ).subscribe((v) => {
      this.viewerWrapper?.setLayerProperty(INC_VOL_ID, {
        transform: v,
      })
    })

    this.store.pipe(
      select(appState.selectors.isDefaultMode),
      takeUntil(this.#destroyed$)
    ).subscribe(isDefaultMode => {
      this.viewerWrapper?.setLayerProperty(INC_VOL_ID, {
        visible: isDefaultMode
      })
    })

    this.actions$.pipe(
      ofType(appState.actions.navigateTo),
      takeUntil(this.#destroyed$),
    ).subscribe(({ position }) => {
      if (!this.viewerWrappers) {
        return
      }
      this.viewerWrappers.forEach(vw => {
        vw.setPosition(position)
      })
    })

    this.#mousedownLm.pipe(
      takeUntil(this.#destroyed$),
      withLatestFrom(
        this.store.pipe(
          select(appState.selectors.hoveredLandmark),
        ),
        this.store.pipe(
          select(appState.selectors.hoveredLandmarkPair),
        ),
        this.store.pipe(
          select(inputs.selectors.selectedTemplate),
        ),
        this.store.pipe(
          select(inputs.selectors.selectedIncoming),
        ),
        this.store.pipe(
          outputs.selectors.getIncXform()
        )
      ),
      filter(([ _, hoveredLandmark ]) => {
        return !!hoveredLandmark
      }),
      switchMap(([
        _,
        hoveredLandmark,
        hoveredLandmarkPair,
        selectedTemplate,
        selectedIncoming,
        xform,
      ]) => this.nehubaSvc.mouseover.pipe(
        filter(v => !!v),
        takeUntil(this.nehubaSvc.mouseup),
        map(position => {
          return {
            hoveredLandmark,
            hoveredLandmarkPair,
            selectedTemplate,
            selectedIncoming,
            position,
            xform,
          }
        }),
      ))
    ).subscribe(({  hoveredLandmark, hoveredLandmarkPair, selectedTemplate, selectedIncoming, position, xform }) => {
      let lmkey: 'incLm' | 'tmplLm' | null = null
      if (!hoveredLandmark?.targetVolumeId  || !hoveredLandmarkPair?.id) {
        console.error(`hoveredLandmark.targetVolumeId must be defined!`)
        return
      }

      let pos: export_nehuba.vec3
      if (hoveredLandmark?.targetVolumeId === selectedTemplate?.['@id']) {
        lmkey = 'tmplLm'
        pos = position
      }
      if (hoveredLandmark?.targetVolumeId === selectedIncoming?.['@id']) {
        lmkey = 'incLm'
        const { vec3, mat4 } = export_nehuba
        const invert = mat4.invert(mat4.create(), xform)
        pos = vec3.transformMat4(vec3.create(), position, invert)
      }

      if (!lmkey) {
        // cannot find if the hovered lm is targeting inc or ref, maybe it's targetting purgatory?
        return
      }

      this.store.dispatch(
        appState.actions.updateLandmarkPair({
          id: hoveredLandmarkPair.id,
          value: {
            [lmkey]: {
              targetVolumeId: hoveredLandmark?.targetVolumeId,
              position: Array.from(pos!)
            }
          }
        })
      )
    })

  }

  async resetOrientation(target: 'reference'|'incoming'){
    if (!this.viewerWrappers) {
      return
    }
    if (target === "reference") {
      this.viewerWrappers.forEach(wrapper => {
        wrapper.setOrientation([0, 0, 0, 1])
      })
    }
    if (target === "incoming") {
      const xform = await firstValueFrom(
        this.store.pipe(
          outputs.selectors.getIncXform(),
        )
      )
      const { mat4, quat } = export_nehuba
      const orientation = mat4.getRotation(quat.create(), xform)
      const orientationArray = Array.from(orientation)
      this.viewerWrappers.forEach(wrapper => {
        wrapper.setOrientation(orientationArray)
      })
    }
  }

  #mousedownLm = new Subject<OverlayLm>()
  handleMousedownLandmark(overlayLm: OverlayLm) {
    this.#mousedownLm.next(overlayLm)
  }

  async handleHoverLandmark(overlayLm: OverlayLm|null){
    if (!overlayLm) {
      this.store.dispatch(
        appState.actions.hoverLandmark({
          landmark: null
        })
      )
      return
    }

    const landmarks = await firstValueFrom(
      this.store.pipe(
        select(appState.selectors.landmarks)
      )
    )

    const foundLm = LandmarkSvc.TranslateOverlayLmToLm(landmarks, overlayLm)

    this.store.dispatch(
      appState.actions.hoverLandmark({
        landmark: foundLm && foundLm.landmark
      })
    )
  }
}
