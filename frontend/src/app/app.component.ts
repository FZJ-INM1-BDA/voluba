import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { User } from 'src/const';
import * as app from 'src/state/app';

@Component({
  selector: 'voluba-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  currentStage$ = this.store$.pipe(select(app.selectors.stage));

  STAGE = app.consts.STAGE;

  constructor(private store$: Store) {
    this.#fetchUser()
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
