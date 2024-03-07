import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryListviewComponent } from './history-listview/history-listview.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [HistoryListviewComponent],
  imports: [CommonModule, MatIconModule, MatListModule, MatRippleModule],
  exports: [HistoryListviewComponent],
})
export class HistoryModule {}
