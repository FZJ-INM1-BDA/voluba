import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { TextOnlySnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { User } from 'src/const';
import { MatSnackBar, MatSnackBarRef } from 'src/sharedModule';
import * as app from 'src/state/app';
import { DestroyDirective } from 'src/util/destroy.directive';

@Component({
  selector: 'voluba-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    DestroyDirective
  ]
})
export class AppComponent {

  #destroyed$ = inject(DestroyDirective).destroyed$

  currentStage$ = this.store$.pipe(select(app.selectors.stage));

  STAGE = app.consts.STAGE;

  #lmSnackBarRef: MatSnackBarRef<TextOnlySnackBar>|null = null

  constructor(private store$: Store, private snackbar: MatSnackBar, @Inject(DOCUMENT) document: Document) {

    document.addEventListener('copy', ev => {
      ev.stopPropagation()
    }, { capture: true })

    this.#fetchUser()

    this.store$.pipe(
      select(app.selectors.addLmMode),
      distinctUntilChanged(),
      takeUntil(this.#destroyed$)
    ).subscribe(flag => {
      if (!flag) {
        if (this.#lmSnackBarRef) {
          this.#lmSnackBarRef.dismiss()
          this.#lmSnackBarRef = null
        }
        return
      }

      this.#lmSnackBarRef = this.snackbar.open(
        `Adding landmarks`,
        "Dismiss",
        {
          duration: -1
        }
      )
      this.#lmSnackBarRef.onAction().subscribe(() => {
        this.store$.dispatch(
          app.actions.setAddLandmarkMode({
            mode: false
          })
        )
      })
    })
  }

  async #fetchUser(){
    try {
      const res = await fetch(`user`)
      if (!res.ok) {
        throw new Error(await res.text() || res.statusText || res.status.toString())
      }
      const user: User = await res.json()
      this.store$.dispatch(
        app.actions.setUser({ user })
      )
    } catch (e) {

    }

  }
}
