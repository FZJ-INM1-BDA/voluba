import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FourCornersComponent } from './four-corners/four-corners.component';

@NgModule({
  declarations: [FourCornersComponent],
  imports: [CommonModule],
  exports: [FourCornersComponent],
})
export class LayoutModule {}
