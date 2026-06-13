import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, Component } from "@angular/core";
import { SharedModule } from "src/sharedModule/sharedModule";

@Component({
  selector: 'ng-layer-shader-tune',
  templateUrl: './ng-layer-shader-tune.template.html',
  styleUrls: [
    './ng-layer-shader-tune.style.scss'
  ],
  imports: [
    SharedModule,
    CommonModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  standalone: true,
})

export class NgLayerShaderTune {

}
