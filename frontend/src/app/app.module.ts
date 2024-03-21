import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutModule } from 'src/layout/layout.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ViewsModule } from 'src/views/views.module';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers, effects } from 'src/state';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from 'src/sharedModule/sharedModule';
import { DEBOUNCED_WINDOW_RESIZE, SLICEVIEWS_INJECTION_TOKEN, SliceViewEvent, SliceViewProviderType, arrayEqual, sliceViewEvEql, sliceViewEvIncludes } from 'src/const';
import { Subject, debounceTime, distinctUntilChanged, map, scan, shareReplay, throttleTime } from 'rxjs';

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
      useFactory: () => {
        const resizeSub = new Subject<UIEvent>()
        window.addEventListener("resize", ev => {
          resizeSub.next(ev)
        })
        return resizeSub.pipe(
          debounceTime(160),
          shareReplay(1),
        )
      }
    },
    {
      provide: SLICEVIEWS_INJECTION_TOKEN,
      useFactory: () => {
        const obs = new Subject<SliceViewEvent>()
        return {
          register: obs.next.bind(obs),
          observable: obs.pipe(
            scan((acc, v) => {
              if (sliceViewEvIncludes(v, acc)) {
                return acc
              }
              return acc.concat(v)
            }, [] as SliceViewEvent[]),
            map(v => v.slice(0, 4)),
            distinctUntilChanged(
              (p, c) => arrayEqual(p, c, sliceViewEvEql)
            ),
            shareReplay(1),
          )
        } as SliceViewProviderType
      }
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
