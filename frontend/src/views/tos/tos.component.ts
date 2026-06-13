import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { SharedModule } from "src/sharedModule/sharedModule";

@Component({
  selector: 'voluba-tos',
  templateUrl: './tos.template.html',
  styleUrls: [
    './tos.style.scss'
  ],
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
  ]
})

export class TOSCmpt {
  showmore = false
}
