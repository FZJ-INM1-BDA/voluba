import { NgModule } from "@angular/core";
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatSliderModule } from "@angular/material/slider"
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    MatSnackBarModule,
    MatSliderModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  exports: [
    MatSnackBarModule,
    MatSliderModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
  ]
})

export class SharedModule{}