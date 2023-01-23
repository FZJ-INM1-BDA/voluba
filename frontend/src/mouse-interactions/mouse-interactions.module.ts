import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MouseInteractionDirective } from './mouse-interaction.directive';

@NgModule({
  declarations: [MouseInteractionDirective],
  imports: [CommonModule],
  exports: [MouseInteractionDirective],
})
export class MouseInteractionsModule {}
