import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as app from "src/state/app"

@Component({
  selector: 'voluba-control-menu',
  templateUrl: './control-menu.component.html',
  styleUrls: ['./control-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlMenuComponent {
  landmarks$ = this.store.pipe(
    select(app.selectors.landmarks),
  )

  constructor(private store: Store){}
}
