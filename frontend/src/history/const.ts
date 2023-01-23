import { State } from 'src/state';
import { RecursivePartial } from 'src/const';

export type HistoryStack = {
  id: string;
  name: string;
  state: RecursivePartial<State>;
};
