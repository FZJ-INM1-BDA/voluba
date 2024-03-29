import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuneUiComponent } from './tune-ui/tune-ui.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ScrollableInput } from './scrollableInput.directive';
import { SharedModule } from 'src/sharedModule/sharedModule';

@NgModule({
  declarations: [
    TuneUiComponent,
    ScrollableInput,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSlideToggleModule,
    SharedModule,
  ],
  exports: [
    TuneUiComponent
  ],
})
export class LayerTuneModule {}
