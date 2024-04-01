import { isDevMode } from '@angular/core';
import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import * as inputs from './inputs';
import * as app from './app';
import * as outputs from './outputs';
import { GeneralEffects } from "./effects"
import * as generalActions from "./actions"

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

function debugFn(reducer: ActionReducer<State>): ActionReducer<State> {
  return function (state, action) {
    console.log('state', state);
    console.log('action', action);

    return reducer(state, action);
  };
}

function generalActionApplyState(reducer: ActionReducer<State>): ActionReducer<State> {
  return function (state, action) {
    if (action.type === generalActions.appplyState.type) {
      return (action as any).state
    }

    return reducer(state, action);
  };
}

export const effects = [outputs.effects.Effects, app.effects.Effects, GeneralEffects];


export const metaReducers: MetaReducer<State>[] = [
  generalActionApplyState,
  ...(isDevMode()
  ? [
      // debugFn
    ]
  : [])
]
