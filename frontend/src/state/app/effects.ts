import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Action, select, Store } from "@ngrx/store";
import * as selectors from "./selectors"
import * as actions from "./actions"
import { filter, from, map, of, switchMap, withLatestFrom } from "rxjs";
import { MatSnackBar } from "src/sharedModule"
import * as outputs from "src/state/outputs"
import * as inputs from "src/state/inputs"
import * as mainInput from "src/state/actions"
import { Landmark } from "./consts";

@Injectable()
export class Effects {
  onExitLmModeClearPurgatory = createEffect(() => this.actions$.pipe(
    ofType(actions.setAddLandmarkMode),
    filter(action => !action.mode),
    map(() => actions.purgePurgatory())
  ))

  onAddLandmarkRequest = createEffect(() => this.actions$.pipe(
    ofType(actions.addLandmark),
    withLatestFrom(
      this.store.pipe(
        select(inputs.selectors.selectedTemplate)
      ),
      this.store.pipe(
        select(inputs.selectors.selectedIncoming)
      ),
      this.store.pipe(
        select(selectors.purgatory)
      ),
      this.store.pipe(
        outputs.selectors.getIncXform()
      ),
      this.store.pipe(
        select(selectors.isDefaultMode)
      )
    ),
    switchMap(([lm, refVol, incVol,  purgatory, xform, isDefaultMode]) => {
      if (!purgatory) {
        if (refVol?.id !== lm.landmark.targetVolumeId) {
          return of(
            mainInput.error({
              message: `First landmark must target reference volume ${refVol?.id}, but instead targets ${lm.landmark.targetVolumeId}`
            })
          )
        }
        return of(
          actions.addToPurgatory({
            landmark: lm.landmark
          })
        )
      }

      if (incVol?.id !== lm.landmark.targetVolumeId) {
        return of(
          mainInput.error({
            message: `Second landmark must target incoming volume ${incVol?.id}, but targets ${lm.landmark.targetVolumeId}`
          })
        )
      }
      const { mat4, vec3 } = export_nehuba
      const lmPos = vec3.fromValues(...lm.landmark.position)
      const inverted = mat4.invert(mat4.create(), xform)
      vec3.transformMat4(lmPos, lmPos, inverted)

      const incLandmark: Landmark = {
        position: Array.from(lmPos) as [number, number, number],
        targetVolumeId: lm.landmark.targetVolumeId
      }

      const invokeActions: Action[] = []

      invokeActions.push(
        actions.purgePurgatory()
      )

      invokeActions.push(
        actions.addLandmarkPair({
          landmarkPair: {
            tmplLm: purgatory,
            incLm: incLandmark,
            name: `Untitled`,
            id: crypto.randomUUID(),
          }
        })
      )
      /**
       * if in two pane mode, exit add landmark mode
       */
      if (!isDefaultMode) {
        invokeActions.push(
          actions.setAddLandmarkMode({ mode: false })
        )
      }

      return from(invokeActions)
    })
  ))

  constructor(private actions$: Actions, private store: Store, private snackbar: MatSnackBar){
    this.actions$.pipe(
      ofType(actions.error)
    ).subscribe(ac => {
      this.snackbar.open(ac.message)
    })
  }
}
