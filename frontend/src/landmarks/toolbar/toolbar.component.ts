import { ChangeDetectionStrategy, Component, Inject, Optional, inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NEVER, combineLatest, filter, finalize, firstValueFrom, lastValueFrom, map, of, switchMap, takeUntil, withLatestFrom } from 'rxjs';
import { EXPORT_LANDMARKS_TYPE, VOLUBA_NEHUBA_TOKEN, VolubeNehuba, isVec3 } from 'src/const';
import * as app from "src/state/app"
import * as inputs from "src/state/inputs"
import * as outputs from "src/state/outputs"
import * as generalActions from "src/state/actions"
import { DestroyDirective } from 'src/util/destroy.directive';

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
    )
  ]).pipe(
    map(([ landmarks, inputFilesName, ref, inc, xform ]) => {

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
        landmarkContent: JSON.stringify(landmarkContent, null, 2),
        landmarkName: `${inputFilesName}-landmarks.json`,
      }
    })
  )

  constructor(
    private store: Store,
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
          app.actions.error({
            message: `Attempting to add landmark without defining reference vol`
          })
        )
        return
      }
      if (!incomingVol) {
        
        this.store.dispatch(
          app.actions.error({
            message: `Attempting to add landmark without defining incoming vol`
          })
        )
        return
      }
      const volId = !!purgatory
      ? incomingVol['@id']
      : referenceVol['@id']
      
      this.store.dispatch(
        app.actions.addLandmark({
          landmark: {
            position: lm,
            targetVolumeId: volId
          }
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
      console.log(inc.coord, ref.coord)
      this.store.dispatch(
        app.actions.addLandmarkPair({
          landmarkPair: {
            id,
            incLm: {
              position: inc.coord.map(v => v*1e6) as [number, number, number],
              targetVolumeId: selectedIncomingVolume['@id']
            },
            tmplLm: {
              position: ref.coord.map(v => v*1e6) as [number, number, number],
              targetVolumeId: selectedRefenceVolume['@id']
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

  onCalculate() {
    console.log('onCalculate');
  }
}
