import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import * as selectors from "./selectors"
import * as actions from "./actions"
import { from, map, of, switchMap, withLatestFrom } from "rxjs";

@Injectable()
export class Effects {
  onAddLandmarkRequest = createEffect(() => this.actions$.pipe(
    ofType(actions.addLandmark),
    withLatestFrom(
      this.store.pipe(
        select(selectors.purgatory)
      )
    ),
    switchMap(([lm, purgatory]) => {
      if (!purgatory) {
        return of(
          actions.addToPurgatory({
            landmark: lm.landmark
          })
        )
      }
      return from(
        [
          actions.purgePurgatory(),
          lm.landmark.targetVolumeId === purgatory.targetVolumeId
          ? actions.error({ message: `Attempting to add landmark pair to the same volume` })
          : actions.addLandmarkPair({
              landmarkPair: {
                tmplLm: purgatory,
                incLm: lm.landmark,
                name: `Untitled`,
                id: crypto.randomUUID(),
                color: "#ff0000"
              }
            })
        ]
      )
    })
  ))

  constructor(private actions$: Actions, private store: Store){}
}