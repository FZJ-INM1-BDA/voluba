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
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
