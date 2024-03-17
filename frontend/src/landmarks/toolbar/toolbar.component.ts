import { ChangeDetectionStrategy, Component, Inject, Optional, inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NEVER, filter, map, of, switchMap, takeUntil, withLatestFrom } from 'rxjs';
import { VOLUBA_NEHUBA_TOKEN, VolubeNehuba, isVec3 } from 'src/const';
import * as app from "src/state/app"
import * as inputs from "src/state/inputs"
import { DestroyDirective } from 'src/util/destroy.directive';

@Component({
  selector: 'voluba-landmark-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    DestroyDirective
  ]
})
export class ToolbarComponent {

  #destroyed$ = inject(DestroyDirective).destroyed$

  bla = this.store.pipe(
    select(app.selectors.purgatory),
  )

  #addLmMode: boolean = false
  addLmMode$ = this.store.pipe(
    select(app.selectors.addLmMode)
  )

  lmToAdd$ = this.addLmMode$.pipe(
    switchMap(flag => flag
      ? this.vn.mouseover.pipe(
        map(v => v && Array.from(v)),
        filter(isVec3)
      )
      : of(null))
  )

  constructor(
    private store: Store,
    @Optional() @Inject(VOLUBA_NEHUBA_TOKEN) private vn: VolubeNehuba
  ){
    this.addLmMode$.pipe(
      takeUntil(this.#destroyed$)
    ).subscribe(flag => {
      this.#addLmMode = flag
    })

    this.lmToAdd$.pipe(
      switchMap(lm => !!lm
        ? this.vn.mousedown.pipe(map(() => lm))
        : NEVER
      ),
      withLatestFrom(
        this.store.pipe(
          select(inputs.selectors.selectedTemplate)
        ),
        this.store.pipe(
          select(inputs.selectors.selectedIncoming)
        ),
        this.store.pipe(
          select(app.selectors.purgatory)
        ),
      ),
      takeUntil(this.#destroyed$)
    ).subscribe(([lm, referenceVol, incomingVol, purgatory]) => {
      
      if (!referenceVol) {
        this.store.dispatch(
          app.actions.error({
            message: `Attempting to add landmark without defining reference vol`
          })
        )
        return
      }
      if (!incomingVol) {
        
        this.store.dispatch(
          app.actions.error({
            message: `Attempting to add landmark without defining incoming vol`
          })
        )
        return
      }
      const volId = !!purgatory
      ? incomingVol['@id']
      : referenceVol['@id']
      
      this.store.dispatch(
        app.actions.addLandmark({
          landmark: {
            position: lm,
            targetVolumeId: volId
          }
        })
      )
    })
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
