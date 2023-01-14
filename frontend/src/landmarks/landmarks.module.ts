import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListviewComponent } from './listview/listview.component';
import { MatTableModule } from "@angular/material/table";
import { ToolbarComponent } from './toolbar/toolbar.component'
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatDividerModule } from "@angular/material/divider"
import { FormsModule } from '@angular/forms';
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"

@NgModule({
  declarations: [
    ListviewComponent,
    ToolbarComponent,
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  exports: [
    ListviewComponent,
    ToolbarComponent,
  ]
})
export class LandmarksModule { }
