import { createReducer, on } from '@ngrx/store';
import { defaultState } from './consts';
import * as actions from './actions';

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
  })
);
