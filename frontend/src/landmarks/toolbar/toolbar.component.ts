import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'voluba-landmark-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  onAddLandmark() {
    console.log('onAddLandmark');
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
