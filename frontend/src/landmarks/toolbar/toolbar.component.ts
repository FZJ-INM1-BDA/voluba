import { ChangeDetectionStrategy, Component, Inject, Optional, inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NEVER, Subject, combineLatest, concat, filter, firstValueFrom, map, merge, of, shareReplay, switchMap, takeUntil, withLatestFrom } from 'rxjs';
import { EXPORT_LANDMARKS_TYPE, LinearXformResult, VOLUBA_APP_CONFIG, VOLUBA_NEHUBA_TOKEN, VolubaAppConfig, VolubeNehuba, isVec3 } from 'src/const';
import * as app from "src/state/app"
import * as inputs from "src/state/inputs"
import * as outputs from "src/state/outputs"
import * as generalActions from "src/state/actions"
import { DestroyDirective } from 'src/util/destroy.directive';
import { HttpClient } from '@angular/common/http';
import { UndoService } from 'src/history/const';

type L = {
  id: string
  name: string
  coord: number[] // in mm
  active: true
}
type LP = {
  id: string
  refId: string
  incId: string
  name: string
  active: true
  // color: string // ignore for now
}


type LMJson = {
  reference_volume: string
  incoming_volume: string
  reference_landmarks: L[]
  incoming_landmarks: L[]
  landmark_pairs: LP[]
  '@type': 'EXPORT_LANDMARKS_TYPE'
}

@Component({
  selector: 'voluba-landmark-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    DestroyDirective
  ]
})
export class ToolbarComponent {

  #destroyed$ = inject(DestroyDirective).destroyed$

  #addLmMode: boolean = false
  addLmMode$ = this.store.pipe(
    select(app.selectors.addLmMode)
  )

  lmToAdd$ = this.addLmMode$.pipe(
    switchMap(flag => flag
      ? this.vn.mouseover.pipe(
        map(v => v && Array.from(v)),
        filter(isVec3)
      )
      : of(null))
  )
  
  #calcTriggered$ = new Subject<string>()
  #newXformFromCalc$ = this.#calcTriggered$.pipe(
    withLatestFrom(
      this.store.pipe(
        select(app.selectors.landmarks)
      )
    ),
    switchMap(([ xformType, landmarks ]) => this.http.post<LinearXformResult>(
      `${this.appConfig.linearBackend}/api/least-squares`,
      {
        transformation_type: xformType,
        landmark_pairs: landmarks.map(({ incLm, tmplLm }) => {
          return {
            source_point: tmplLm.position,
            target_point: incLm.position
          }
        })
      }
    )),
    shareReplay(1),
  )

  view$ = combineLatest([
    this.store.pipe(
      select(app.selectors.landmarks)
    ),
    this.store.pipe(
      select(inputs.selectors.inputFilesName)
    ),
    this.store.pipe(
      select(inputs.selectors.selectedTemplate)
    ),
    this.store.pipe(
      select(inputs.selectors.selectedIncoming)
    ),
    this.store.pipe(
      outputs.selectors.getIncXform()
    ),
    concat(
      of(false),
      merge(
        this.#calcTriggered$.pipe(
          map(() => true)
        ),
        this.#newXformFromCalc$.pipe(
          map(() => false)
        )
      )
    )
  ]).pipe(
    map(([ landmarks, inputFilesName, ref, inc, xform, calcXformBusy ]) => {

      const { mat4, vec3 } = export_nehuba

      const refLm: L[] = landmarks.map(lm => {
        return {
          id: `${lm.id}-ref`,
          active: true,
          coord: lm.tmplLm.position.map(v => v/1e6),
          name: `${lm.name}-ref`
        }
      })
      
      const incLm: L[] = landmarks.map(lm => {
        const posInIncSpace = vec3.transformMat4(
          vec3.create(),
          vec3.fromValues(...lm.incLm.position),
          xform)
        return {
          id: `${lm.id}-inc`,
          active: true,
          coord: Array.from(posInIncSpace).map(v => v * 1e6),
          name: `${lm.name}-inc`,
        }
      })

      const lmP: LP[] = landmarks.map(lm => {
        return {
          id: lm.id,
          name: lm.name,
          active: true,
          incId: `${lm.id}-inc`,
          refId: `${lm.id}-ref`,
        }
      })
      const landmarkContent = {
        reference_volume: ref?.name || 'Untitled Reference Volume',
        incoming_volume: inc?.name || 'Untitled Incoming Volume',
        reference_landmarks: refLm,
        incoming_landmarks: incLm,
        landmark_pairs: lmP,
        ['@type']: EXPORT_LANDMARKS_TYPE
      }

      return {
        calcXformBusy,
        transformationTypes: this.transformationTypes,
        landmarkLength: landmarks.length,
        landmarkContent: JSON.stringify(landmarkContent, null, 2),
        landmarkName: `${inputFilesName}-landmarks.json`,
      }
    })
  )

  transformationTypes = [
    { text: 'Rigid', value: 'rigid' },
    { text: 'Rigid (allow reflection)', value: 'rigid+reflection' },
    { text: 'Similarity', value: 'similarity' },
    { text: 'Similarity (allow reflection)', value: 'similarity+reflection' },
    { text: 'Affine', value: 'affine' }
  ]

  constructor(
    private store: Store,
    private http: HttpClient,
    private undoSvc: UndoService,
    @Inject(VOLUBA_APP_CONFIG) private appConfig: VolubaAppConfig,
    @Optional() @Inject(VOLUBA_NEHUBA_TOKEN) private vn: VolubeNehuba
  ){
    this.addLmMode$.pipe(
      takeUntil(this.#destroyed$)
    ).subscribe(flag => {
      this.#addLmMode = flag
    })

    this.lmToAdd$.pipe(
      switchMap(lm => !!lm
        ? this.vn.mousedown.pipe(map(() => lm))
        : NEVER
      ),
      withLatestFrom(
        this.store.pipe(
          select(inputs.selectors.selectedTemplate)
        ),
        this.store.pipe(
          select(inputs.selectors.selectedIncoming)
        ),
        this.store.pipe(
          select(app.selectors.purgatory)
        ),
      ),
      takeUntil(this.#destroyed$)
    ).subscribe(([lm, referenceVol, incomingVol, purgatory]) => {
      
      if (!referenceVol) {
        this.store.dispatch(
          generalActions.error({
            message: `Attempting to add landmark without defining reference vol`
          })
        )
        return
      }
      if (!incomingVol) {
        
        this.store.dispatch(
          generalActions.error({
            message: `Attempting to add landmark without defining incoming vol`
          })
        )
        return
      }
      const volId = !!purgatory
      ? incomingVol.id
      : referenceVol.id
      
      this.store.dispatch(
        app.actions.addLandmark({
          landmark: {
            position: lm,
            targetVolumeId: volId
          }
        })
      )
    })

    this.#newXformFromCalc$.pipe(
      takeUntil(this.#destroyed$)
    ).subscribe(result => {
      const { mat4 } = export_nehuba
      
      const newXform = mat4.fromValues(...result.inverse_matrix.flatMap(v => v))
      mat4.transpose(newXform, newXform)
      this.undoSvc.pushUndo(`Apply transform via landmark alignment.`)
      this.store.dispatch(
        outputs.actions.setIncMatrix({
          text: Array.from(newXform).join(",")
        })
      )
    })
  }

  toggleLandmarkMode() {
    this.store.dispatch(
      app.actions.setAddLandmarkMode({
        mode: !this.#addLmMode
      })
    )
  }
  async handleLoadJson(jsonTxt: string){
    const lm: LMJson = JSON.parse(jsonTxt)
    const { selectedRefenceVolume, selectedIncomingVolume, landmarks } = await firstValueFrom(
      combineLatest([
        this.store.pipe(
          select(inputs.selectors.selectedTemplate)
        ),
        this.store.pipe(
          select(inputs.selectors.selectedIncoming)
        ),
        this.store.pipe(
          select(app.selectors.landmarks)
        )
      ]).pipe(
        map(([ selectedRefenceVolume, selectedIncomingVolume, landmarks ]) => ({ selectedRefenceVolume, selectedIncomingVolume, landmarks })),
      )
    )
    if (!selectedRefenceVolume || !selectedIncomingVolume) {
      throw new Error(`Ref volume or incoming volume not yet selected`)
    }

    const currLmIdSet = new Set(landmarks.map(lm => lm.id))

    const { reference_landmarks, incoming_landmarks, landmark_pairs } = lm
    
    const info: string[] = []

    const existingLms = landmark_pairs.filter(lmp => currLmIdSet.has(lmp.id))
    if (existingLms.length > 0) {
      info.push(`Landmarks with ids ${existingLms.map(lm => lm.id)} already exist. Skipped.`)
    }
    const newLms = landmark_pairs.filter(lmp => !currLmIdSet.has(lmp.id))

    let addedLmCounter = 0
    for (const lm of newLms) {
      const { id, incId, refId, name } = lm
      const inc = incoming_landmarks.find(incLm => incLm.id === incId)
      const ref = reference_landmarks.find(refLm => refLm.id === refId)
      if (!inc || !ref) {
        info.push(`Landmark with id ${id}, invalid ref or inc reference.`)
        continue
      }
      
      this.store.dispatch(
        app.actions.addLandmarkPair({
          landmarkPair: {
            id,
            incLm: {
              position: inc.coord.map(v => v*1e6) as [number, number, number],
              targetVolumeId: selectedIncomingVolume.id
            },
            tmplLm: {
              position: ref.coord.map(v => v*1e6) as [number, number, number],
              targetVolumeId: selectedRefenceVolume.id
            },
            name
          }
        })
      )
      addedLmCounter ++
    }

    if (addedLmCounter > 0) {
      info.push(`Added ${addedLmCounter} landmark pairs.`)
    }
    
    if (info.length > 0) {
      this.store.dispatch(
        generalActions.info({
          message: info.join("\n")
        })
      )
    }
  }

  onCalculate(xformTypeValue: string) {
    this.#calcTriggered$.next(xformTypeValue)
  }
}
