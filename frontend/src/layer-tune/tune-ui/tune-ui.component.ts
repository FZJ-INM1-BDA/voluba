import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import * as outputs from "src/state/outputs"

@Component({
  selector: 'voluba-tune-ui',
  templateUrl: './tune-ui.component.html',
  styleUrls: ['./tune-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TuneUiComponent implements OnDestroy{
  tuneInput = new FormGroup({
    translateX: new FormControl<number>(1),
    translateY: new FormControl<number>(2),
    translateZ: new FormControl<number>(3),

    isotropic: new FormControl<boolean>(true),

    scaleX: new FormControl<number>(1),
    scaleY: new FormControl<number>(1),
    scaleZ: new FormControl<number>(1),

    // rotation
  })

  constructor(private store: Store) {
    const matFromStore = this.store.pipe(
      select(outputs.selectors.incMatrixMat4)
    ).subscribe(xform => {
      const { mat4, vec3 } = export_nehuba
      const translate = Array.from(mat4.getTranslation(vec3.create(), xform))
      const scale = Array.from(mat4.getScaling(vec3.create(), xform))
      
      this.tuneInput.patchValue({
        translateX: translate[0],
        translateY: translate[1],
        translateZ: translate[2],

        scaleX: scale[0],
        scaleY: scale[1],
        scaleZ: scale[2],
      })
    })

    // TODO figure out a better way to do this than subscribing individual changes
    const onFormChangeUpdateStore = this.tuneInput.valueChanges.subscribe(values => {
      const { translateX, translateY, translateZ } = values
      if (translateX === 0 || !!translateX) {
        this.store.dispatch(
          outputs.actions.setIncTranslationX({ value: translateX })
        )
      }
    })

    this.#onDestroyCb.push(() => matFromStore.unsubscribe())
  }

  #onDestroyCb: (() => void)[] = []
  ngOnDestroy(): void {
    while(this.#onDestroyCb.length > 0) this.#onDestroyCb.pop()!()
  }
}
