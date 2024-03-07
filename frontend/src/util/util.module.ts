import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogDirective } from './dialog.directive';
import { MatDialogModule } from '@angular/material/dialog';
import { MovablePortalComponent } from './movable-portal/movable-portal.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [DialogDirective, MovablePortalComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
  ],
  exports: [DialogDirective, MovablePortalComponent],
})
export class UtilModule {}
