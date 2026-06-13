import { NgModule } from "@angular/core";
import { SaveToFileDirective } from "./saveFile.directive";
import { LoadFromFileDirective } from "./loadFile.directive";
import { DragDropFileDirective } from "./dragDrop.directive";
import { SharedModule } from "src/sharedModule/sharedModule";

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    SaveToFileDirective,
    LoadFromFileDirective,
    DragDropFileDirective,
  ],
  exports: [
    SaveToFileDirective,
    LoadFromFileDirective,
    DragDropFileDirective,
  ]
})

export class IOModule{}
