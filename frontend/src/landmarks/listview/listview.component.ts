import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TrackByFunction,
} from '@angular/core';
import { LandmarkPair, Landmark, INCOMING_LM_COLOR, REF_LM_COLOR } from '../const';
import { Store } from '@ngrx/store';
import { actions } from 'src/state/app';

@Component({
  selector: 'voluba-landmark-listview',
  templateUrl: './listview.component.html',
  styleUrls: ['./listview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListviewComponent {

  INCOMING_LM_COLOR = INCOMING_LM_COLOR
  REF_LM_COLOR = REF_LM_COLOR

  @Input()
  landmarkPair: LandmarkPair[] = [];

  displayedColumns: string[] = ['name', 'toTmpl', 'toInc'];

  public trackBy: TrackByFunction<LandmarkPair> = (
    _idx: number,
    landmarkPair: LandmarkPair
  ) => landmarkPair.id;

  constructor(private store: Store){

  }

  onUpdateName(landmarkPair: LandmarkPair, inputEvent: Event) {
    const { id } = landmarkPair
    this.store.dispatch(
      actions.updateLandmarkPair({
        id,
        value: {
          name: (inputEvent.target as HTMLInputElement).value || ''
        }
      })
    )
  }

  onClickLocation(landmark: Landmark) {
    console.log(landmark);
  }
}
