import { createReducer, on } from '@ngrx/store';
import { defaultState } from './consts';
import * as actions from './actions';
import { isDefined } from 'src/const';

export const reducer = createReducer(
  defaultState,
  on(actions.setIncMatrix, (state, { array, text }) => {
    let returnString: string | null = null;
    if (text) returnString = text;
    if (array) returnString = array.flatMap((v) => v).join(',');
    if (!returnString)
      throw new Error(
        `returnString not set. You must provide one of the following: text, array, mat4`
      );
    return {
      ...state,
      transformStr: returnString,
    };
  }),
  on(actions.flipAxis, (state, { axis }) => {
    const axesState = state.flippedState.split(",").map(v => Number(v))
    let idx: number|undefined
    if (axis === 'x') idx = 0
    if (axis === 'y') idx = 1
    if (axis === 'z') idx = 2
    if (!isDefined(idx)) {
      console.error(`Cannot figure out axis ${axis}.`)
      return { ...state }
    }
    axesState[idx] *= -1
    return {
      ...state,
      flippedState: axesState.join(",")
    }
  })
);
