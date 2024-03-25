import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeCardComponent } from './welcome-card/welcome-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { InputVolumesComponent } from './input-volumes/input-volumes.component';
import { MatButtonModule } from '@angular/material/button';
import { ViewerComponent } from './viewer/viewer.component';
import { LayoutModule } from 'src/layout/layout.module';
import { ControlMenuComponent } from './control-menu/control-menu.component';
import { MatIconModule } from '@angular/material/icon';
import { LandmarksModule } from 'src/landmarks/landmarks.module';
import { HistoryModule } from 'src/history/history.module';
import { NehubaViewerWrapperComponent } from './nehuba-viewer-wrapper/nehuba-viewer-wrapper.component';
import { MatDialogModule } from '@angular/material/dialog';
import { UtilModule } from 'src/util/util.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayerTuneModule } from 'src/layer-tune/layer-tune.module';
import { ShareExportComponent } from './shareExport/shareExport.component';
import { SharedModule } from 'src/sharedModule/sharedModule';
import { DisplayNumArrayPipe } from './viewer/displayNumArray.pipe';
import { MouseInteractionDirective } from 'src/mouse-interactions/mouse-interaction.directive';

@NgModule({
  declarations: [
    WelcomeCardComponent,
    InputVolumesComponent,
    ViewerComponent,
    ControlMenuComponent,
    NehubaViewerWrapperComponent,
    ShareExportComponent,
    DisplayNumArrayPipe,
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
    MatDialogModule,
    UtilModule,
    DragDropModule,
    LayerTuneModule,
    SharedModule,

    /**
     * standalone directives
     */
    MouseInteractionDirective,
  ],
  exports: [WelcomeCardComponent, ViewerComponent],
})
export class ViewsModule {}
