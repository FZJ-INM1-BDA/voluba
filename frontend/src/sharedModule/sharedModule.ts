import { NgModule } from "@angular/core";
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatSliderModule } from "@angular/material/slider"
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatTabsModule } from "@angular/material/tabs"
import { MatBottomSheetModule } from "@angular/material/bottom-sheet"
import { MatMenuModule } from "@angular/material/menu"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { FormsModule } from "@angular/forms";


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
    MatTooltipModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatBottomSheetModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule,
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
    MatTooltipModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatBottomSheetModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule,
  ]
})

export class SharedModule{}