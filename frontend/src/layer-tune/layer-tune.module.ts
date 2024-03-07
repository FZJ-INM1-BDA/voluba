import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuneUiComponent } from './tune-ui/tune-ui.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [TuneUiComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  exports: [TuneUiComponent],
})
export class LayerTuneModule {}
