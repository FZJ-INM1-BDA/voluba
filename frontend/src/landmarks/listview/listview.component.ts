import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TrackByFunction,
} from '@angular/core';
import { LandmarkPair, Landmark } from '../const';

@Component({
  selector: 'voluba-landmark-listview',
  templateUrl: './listview.component.html',
  styleUrls: ['./listview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListviewComponent {
  @Input()
  landmarkPair: LandmarkPair[] = [];

  displayedColumns: string[] = ['color', 'name', 'toTmpl', 'toInc'];

  public trackBy: TrackByFunction<LandmarkPair> = (
    _idx: number,
    landmarkPair: LandmarkPair
  ) => landmarkPair.id;

  onUpdateColor(landmarkPair: LandmarkPair, inputEvent: Event) {
    console.log(landmarkPair, (inputEvent.target as HTMLInputElement).value);
  }

  onUpdateName(landmarkPair: LandmarkPair, inputEvent: Event) {
    console.log(landmarkPair, (inputEvent.target as HTMLInputElement).value);
  }

  onClickLocation(landmark: Landmark) {
    console.log(landmark);
  }
}
