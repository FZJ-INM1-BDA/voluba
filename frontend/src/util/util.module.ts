import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogDirective } from './dialog.directive';
import { MatDialogModule } from '@angular/material/dialog';
import { MovablePortalComponent } from './movable-portal/movable-portal.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BottomSheetDirective } from './bottomSheet.directive';

@NgModule({
  declarations: [
    DialogDirective,
    MovablePortalComponent,
    BottomSheetDirective,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
  ],
  exports: [
    DialogDirective,
    MovablePortalComponent,
    BottomSheetDirective,
  ],
})
export class UtilModule {}
