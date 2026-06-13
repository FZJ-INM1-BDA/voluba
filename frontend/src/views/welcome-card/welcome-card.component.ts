import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import * as inputs from 'src/state/inputs';
import * as app from 'src/state/app';

@Component({
  selector: 'voluba-welcome-card',
  templateUrl: './welcome-card.component.html',
  styleUrls: ['./welcome-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeCardComponent {

  view$ = combineLatest([
    this.store.pipe(select(inputs.selectors.selectedIncoming)),
    this.store.pipe(select(inputs.selectors.selectedTemplate)),
  ]).pipe(
    map(([incoming, template]) => {

      return {
        allowStart: !!incoming && !!template,
      }
    })
  )

  start() {
    this.store.dispatch(
      app.actions.goToStage({
        stage: app.consts.STAGE.ALIGNMENT,
      })
    );
  }

  constructor(private store: Store) {}
}
