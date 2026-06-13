import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HistoryStack, UndoService } from '../const';
import { combineLatest, concat, map, of } from 'rxjs';

@Component({
  selector: 'voluba-history-listview',
  templateUrl: './history-listview.component.html',
  styleUrls: ['./history-listview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryListviewComponent {

  view$ = combineLatest([
    concat(
      of([]),
      this.svc.undoStack$,
    )
  ]).pipe(
    map(([ history ]) => {
      const clonedHistory = structuredClone(history)
      clonedHistory.reverse()
      return {
        history: clonedHistory
      }
    })
  )

  revert(history: HistoryStack) {
    this.svc.resetTo(history.id)
  }

  constructor(private svc: UndoService){

  }
}
