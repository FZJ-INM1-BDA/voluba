import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeCardComponent } from './welcome-card/welcome-card.component';
import { MatCardModule } from "@angular/material/card"
import { MatSelectModule } from "@angular/material/select"
import { ReactiveFormsModule } from '@angular/forms';
import { InputVolumesComponent } from './input-volumes/input-volumes.component';
import { MatButtonModule } from "@angular/material/button";
import { ViewerComponent } from './viewer/viewer.component'
import { LayoutModule } from 'src/layout/layout.module';
import { ControlMenuComponent } from './control-menu/control-menu.component';
import { MatIconModule } from "@angular/material/icon"
import { LandmarksModule } from 'src/landmarks/landmarks.module';
import { HistoryModule } from 'src/history/history.module';
import { NehubaViewerWrapperComponent } from './nehuba-viewer-wrapper/nehuba-viewer-wrapper.component';
import { MouseInteractionsModule } from 'src/mouse-interactions/mouse-interactions.module';
import { MatDialogModule } from "@angular/material/dialog"
import { UtilModule } from 'src/util/util.module';
import { DragDropModule } from "@angular/cdk/drag-drop"
import { LayerTuneModule } from 'src/layer-tune/layer-tune.module';

@NgModule({
  declarations: [
    WelcomeCardComponent,
    InputVolumesComponent,
    ViewerComponent,
    ControlMenuComponent,
    NehubaViewerWrapperComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    LayoutModule,
    MatIconModule,
    LandmarksModule,
    HistoryModule,
    MouseInteractionsModule,
    MatDialogModule,
    UtilModule,
    DragDropModule,
    LayerTuneModule,
  ],
  exports: [
    WelcomeCardComponent,
    ViewerComponent,
  ]
})
export class ViewsModule { }
