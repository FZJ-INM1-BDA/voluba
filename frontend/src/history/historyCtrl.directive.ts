import { Directive } from "@angular/core";
import { UndoService } from "./const";

@Directive({
  selector: '[voluba-history-controller]',
  exportAs: 'historyController'
})

export class HistoryControllerDirective {
  constructor(private undoSvc: UndoService){}

  resetTo(id: string) {
    this.undoSvc.resetTo(id)
  }
  rewind(){
    this.undoSvc.rewind()
  }
  forward(){
    this.undoSvc.forward()
  }
}
