import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TrackByFunction,
} from '@angular/core';
import { LandmarkPair, Landmark, INCOMING_LM_COLOR, REF_LM_COLOR } from '../const';
import { Store, select } from '@ngrx/store';
import * as appState from "src/state/app"
import * as inputs from "src/state/inputs"
import * as outputs from "src/state/outputs"
import { combineLatest, firstValueFrom } from 'rxjs';


@Component({
  selector: 'voluba-landmark-listview',
  templateUrl: './listview.component.html',
  styleUrls: ['./listview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListviewComponent {

  INCOMING_LM_COLOR = INCOMING_LM_COLOR
  REF_LM_COLOR = REF_LM_COLOR

  hoveredLMP$ = this.store.pipe(
    select(appState.selectors.hoveredLandmarkPair)
  )

  @Input()
  landmarkPair: LandmarkPair[] = [];

  displayedColumns: string[] = ['delete', 'name', 'toTmpl', 'toInc'];

  public trackBy: TrackByFunction<LandmarkPair> = (
    _idx: number,
    landmarkPair: LandmarkPair
  ) => landmarkPair.id;

  constructor(private store: Store){
  }

  onUpdateName(landmarkPair: LandmarkPair, inputEvent: Event) {
    const { id } = landmarkPair
    this.store.dispatch(
      appState.actions.updateLandmarkPair({
        id,
        value: {
          name: (inputEvent.target as HTMLInputElement).value || ''
        }
      })
    )
  }

  async onClickLocation(landmark: Landmark) {
    const [ inc, xform ] = await firstValueFrom(
      combineLatest([
        this.store.pipe(
          select(inputs.selectors.selectedIncoming)
        ),
        this.store.pipe(
          outputs.selectors.getIncXform()
        )
      ])
    )
    const position = [...landmark.position]
    const { vec3 } = export_nehuba
    if (landmark.targetVolumeId === inc?.id) {
      vec3.transformMat4(position, position, xform)
    }

    this.store.dispatch(
      appState.actions.navigateTo({
        position
      })
    )
  }

  handleHoverLm(landmark: Landmark|null) {
    this.store.dispatch(
      appState.actions.hoverLandmark({ landmark })
    )
  }

  deleteLmp(landmarkPair: LandmarkPair) {
    this.store.dispatch(
      appState.actions.deleteLandmarkPair({
        landmarkPair
      })
    )
  }
}
