import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuneUiComponent } from './tune-ui/tune-ui.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SharedModule } from 'src/sharedModule/sharedModule';
import { DialCmp } from 'src/components/dial/dial.component';

@NgModule({
  declarations: [
    TuneUiComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSlideToggleModule,
    SharedModule,

    DialCmp,
  ],
  exports: [
    TuneUiComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ]
})
export class LayerTuneModule {}
