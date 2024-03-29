import { CommonModule } from "@angular/common";
import { NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { GetClosestFurtherestPipe } from "./pathGetClosestFarthest.pipe";
import { SvgPathToDPipe } from "./pathToD.pipe";
import { RotationWidgetCmp } from "./rotation-widget.components";

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    RotationWidgetCmp,
    SvgPathToDPipe,
    GetClosestFurtherestPipe,
  ],
  exports: [
    RotationWidgetCmp
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
  ]
})

export class RotationWidgetModule {}
