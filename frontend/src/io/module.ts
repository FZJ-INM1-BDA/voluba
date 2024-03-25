import { NgModule } from "@angular/core";
import { SaveToFileDirective } from "./saveFile.directive";
import { LoadFromFileDirective } from "./loadFile.directive";

@NgModule({
  declarations: [
    SaveToFileDirective,
    LoadFromFileDirective,
  ],
  exports: [
    SaveToFileDirective,
    LoadFromFileDirective,
  ]
})

export class IOModule{}
