import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'voluba-control-menu',
  templateUrl: './control-menu.component.html',
  styleUrls: ['./control-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlMenuComponent {}
