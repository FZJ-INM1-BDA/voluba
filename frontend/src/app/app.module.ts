import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutModule } from 'src/layout/layout.module';
import { isDefaultMode } from "src/state/app/selectors"

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ViewsModule } from 'src/views/views.module';
import { Store, StoreModule, select } from '@ngrx/store';
import { reducers, metaReducers, effects } from 'src/state';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from 'src/sharedModule/sharedModule';
import { DEBOUNCED_WINDOW_RESIZE } from 'src/const';
import { Subject, debounceTime, map, merge, shareReplay } from 'rxjs';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    LayoutModule,
    BrowserAnimationsModule,
    ViewsModule,
    SharedModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
    }),
    EffectsModule.forRoot(effects),
  ],
  providers: [
    {
      provide: DEBOUNCED_WINDOW_RESIZE,
      useFactory: (store: Store) => {
        const resizeSub = new Subject<UIEvent>()
        window.addEventListener("resize", ev => {
          resizeSub.next(ev)
        })

        return merge(
          store.pipe(
            select(isDefaultMode),
            map(flag => new UIEvent(`x-resize-default-mode-${flag ? 'on' : 'off'}`))
          ),
          resizeSub,
        ).pipe(
          debounceTime(160),
          shareReplay(1),
        )
      },
      deps: [ Store ]
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
