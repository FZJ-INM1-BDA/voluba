import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import * as selectors from "./selectors"
import * as actions from "./actions"
import { from, of, switchMap, withLatestFrom } from "rxjs";
import { MatSnackBar } from "src/sharedModule"
import * as outputs from "src/state/outputs"
import * as inputs from "src/state/inputs"
import * as mainInput from "src/state/actions"
import { Landmark } from "./consts";

@Injectable()
export class Effects {
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
      )
    ),
    switchMap(([lm, refVol, incVol,  purgatory, xform]) => {
      if (!purgatory) {
        if (refVol?.["@id"] !== lm.landmark.targetVolumeId) {
          return of(
            mainInput.error({
              message: `First landmark must target reference volume ${refVol?.["@id"]}, but instead targets ${lm.landmark.targetVolumeId}`
            })
          )
        }
        return of(
          actions.addToPurgatory({
            landmark: lm.landmark
          })
        )
      }

      if (incVol?.["@id"] !== lm.landmark.targetVolumeId) {
        return of(
          mainInput.error({
            message: `Second landmark must target incoming volume ${incVol?.["@id"]}, but targets ${lm.landmark.targetVolumeId}`
          })
        )
      }
      const { mat4, vec3 } = export_nehuba
      const lmPos = vec3.fromValues(...lm.landmark.position)
      mat4.invert(xform, xform)
      vec3.transformMat4(lmPos, lmPos, xform)

      const incLandmark: Landmark = {
        position: Array.from(lmPos) as [number, number, number],
        targetVolumeId: lm.landmark.targetVolumeId
      }
      return from(
        [
          actions.purgePurgatory(),
          lm.landmark.targetVolumeId === purgatory.targetVolumeId
          ? actions.error({ message: `Attempting to add landmark pair to the same volume` })
          : actions.addLandmarkPair({
              landmarkPair: {
                tmplLm: purgatory,
                incLm: incLandmark,
                name: `Untitled`,
                id: crypto.randomUUID(),
              }
            })
        ]
      )
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