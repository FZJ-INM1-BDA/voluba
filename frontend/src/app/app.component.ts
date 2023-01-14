import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as app from "src/state/app"

@Component({
  selector: 'voluba-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  currentStage$ = this.store$.pipe(
    select(app.selectors.stage)
  )

  STAGE = app.consts.STAGE

  constructor(private store$: Store){
    
  }
}
