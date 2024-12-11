import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryListviewComponent } from './history-listview/history-listview.component';
import { UndoService } from './const';
import { SharedModule } from 'src/sharedModule/sharedModule';
import { ExtractActiveHistoryPipe } from './extractHistoryList.pipe';
import { HistoryControllerDirective } from './historyCtrl.directive';

@NgModule({
  declarations: [
    HistoryListviewComponent,
    ExtractActiveHistoryPipe,
    HistoryControllerDirective,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    HistoryListviewComponent,
    HistoryControllerDirective,
  ],
  providers: [ UndoService ]
})
export class HistoryModule {}
