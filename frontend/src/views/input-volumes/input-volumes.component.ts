import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as inputs from 'src/state/inputs';

@Component({
  selector: 'voluba-input-volumes',
  templateUrl: './input-volumes.component.html',
  styleUrls: ['./input-volumes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputVolumesComponent implements OnDestroy {
  inputCtrl = new FormGroup({
    selectedTemplate: new FormControl<string | null>(null),
    selectedIncoming: new FormControl<string | null>(null),
  });

  availableTemplates$ = this.store$.pipe(
    select(inputs.selectors.templateVolumes)
  );

  availableIncomings$ = this.store$.pipe(
    select(inputs.selectors.incomingVolumes)
  );

  #subscriptions: Subscription[] = [];

  constructor(private store$: Store) {
    this.#subscriptions.push(
      this.inputCtrl.valueChanges.subscribe(
        ({ selectedTemplate, selectedIncoming }) => {
          if (selectedTemplate)
            this.store$.dispatch(
              inputs.actions.selectTemplate({ '@id': selectedTemplate })
            );
          if (selectedIncoming)
            this.store$.dispatch(
              inputs.actions.selecteIncoming({ '@id': selectedIncoming })
            );
        }
      )
    );
  }

  ngOnDestroy(): void {
    while (this.#subscriptions.length > 0)
      this.#subscriptions.pop()?.unsubscribe();
  }
}
