import { NgModule } from "@angular/core";
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatSliderModule } from "@angular/material/slider"
import { MatButtonModule } from "@angular/material/button";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatSliderModule,
    MatButtonModule,
  ],
  exports: [
    MatSnackBarModule,
    MatSliderModule,
    MatButtonModule,
  ]
})

export class SharedModule{}