import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListviewComponent } from './listview/listview.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SharedModule } from 'src/sharedModule/sharedModule';
import { OverlayComponent } from './overlay/overlay.component';
import { OverlayPositionPipe } from './overlay/overlayPosition.pipe';

@NgModule({
  declarations: [
    ListviewComponent,
    ToolbarComponent,
    OverlayComponent,
    OverlayPositionPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
  ],
  exports: [ListviewComponent, ToolbarComponent, OverlayComponent],
})
export class LandmarksModule {}
