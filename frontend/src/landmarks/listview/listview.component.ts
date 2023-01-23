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
  @Input('landmark-pairs')
  landmarkPair: LandmarkPair[] = [
    {
      color: '#ff2233',
      id: 'foo-id',
      name: 'foo-name',
      incLm: {
        position: [1, 2, 3],
        targetVolumeId: 'foo-inclLm-target-volume',
      },
      tmplLm: {
        position: [1, 2, 3],
        targetVolumeId: 'foo-tmpLm-target-volume',
      },
    },
  ];

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
