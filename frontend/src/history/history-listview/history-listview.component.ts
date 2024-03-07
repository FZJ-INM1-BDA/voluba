import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HistoryStack } from '../const';

const _tmpHistory: HistoryStack = {
  id: 'baz',
  name: 'foo-stuff',
  state: {
    '[inputs]': {
      incomingVolumes: [],
      selectedIncoming: null,
      selectedTemplate: null,
      templateVolumes: [],
    },
  },
};
const _tmpHistory2: HistoryStack = {
  id: 'foo',
  name: 'foo-stuff-2',
  state: {},
};

@Component({
  selector: 'voluba-history-listview',
  templateUrl: './history-listview.component.html',
  styleUrls: ['./history-listview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryListviewComponent {
  @Input()
  history: HistoryStack[] = [_tmpHistory, _tmpHistory2];

  @Input()
  activeHistory: HistoryStack | null = _tmpHistory;

  revert(history: HistoryStack) {
    console.log('reverting history', history);
  }
}
