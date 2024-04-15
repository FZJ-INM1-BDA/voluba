import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as actions from "./actions"
import { MatSnackBar, MatSnackBarConfig } from "src/sharedModule"
import { map } from "rxjs";

@Injectable()
export class GeneralEffects {

  snackbarCfg: MatSnackBarConfig = {
    duration: 5000
  }

  onInfo = createEffect(() => this.actions$.pipe(
    ofType(actions.info),
    map(action => {
      this.snackbar.open(action.message, "Dismiss", this.snackbarCfg)
    })
  ), { dispatch: false })

  onError = createEffect(() => this.actions$.pipe(
    ofType(actions.error),
    map(action => {
      this.snackbar.open(action.message, "Dismiss", this.snackbarCfg)
    })
  ), { dispatch: false })

  constructor(private actions$: Actions, private snackbar: MatSnackBar){

  }
}
