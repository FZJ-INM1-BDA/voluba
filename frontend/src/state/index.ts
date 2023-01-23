import { isDevMode } from '@angular/core';
import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import * as inputs from './inputs';
import * as app from './app';
import * as outputs from './outputs';

export type State = {
  [inputs.consts.nameSpace]: inputs.consts.LocalState;
  [app.consts.nameSpace]: app.consts.LocalState;
  [outputs.consts.nameSpace]: outputs.consts.LocalState;
};

export const reducers: ActionReducerMap<State> = {
  [inputs.consts.nameSpace]: inputs.state.reducer,
  [app.consts.nameSpace]: app.state.reducer,
  [outputs.consts.nameSpace]: outputs.state.reducer,
};

function debug(reducer: ActionReducer<State>): ActionReducer<State> {
  return function (state, action) {
    console.log('state', state);
    console.log('action', action);

    return reducer(state, action);
  };
}

export const effects = [outputs.effects.Effects];

export const metaReducers: MetaReducer<State>[] = isDevMode()
  ? [
      // debug
    ]
  : [];
