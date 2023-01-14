import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'voluba-movable-portal',
  templateUrl: './movable-portal.component.html',
  styleUrls: ['./movable-portal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovablePortalComponent {
  @Input()
  title: string|null = null
}
