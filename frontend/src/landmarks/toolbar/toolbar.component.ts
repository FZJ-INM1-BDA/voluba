import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as app from "src/state/app"

@Component({
  selector: 'voluba-landmark-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnDestroy{
  bla = this.store.pipe(
    select(app.selectors.purgatory),
  )

  #addLmMode: boolean = false
  addLmMode$ = this.store.pipe(
    select(app.selectors.addLmMode)
  )

  #onDestroy: (() => void)[] = []
  constructor(private store: Store){
    const sub = this.addLmMode$.subscribe(val => this.#addLmMode = val)
    this.#onDestroy.push(() => sub.unsubscribe())
  }
  
  ngOnDestroy(): void {
    while (this.#onDestroy.length > 0) this.#onDestroy.pop()!()
  }

  #tmp = 0
  _tmp() {
    this.#tmp ++
    console.log(this.#tmp)
    this.store.dispatch(
      app.actions.addLandmark({
        landmark: {
          position: [0, 0, 0],
          targetVolumeId: `foo-bar-${this.#tmp}`
        }
      })
    )
  }

  toggleLandmarkMode() {
    this.store.dispatch(
      app.actions.setAddLandmarkMode({
        mode: !this.#addLmMode
      })
    )
  }

  onSave() {
    console.log('onSave');
  }

  onLoad() {
    console.log('onLoad');
  }

  onCalculate() {
    console.log('onCalculate');
  }
}
