import { Directive, HostListener, Input, TemplateRef } from "@angular/core";
import { MatBottomSheet, MatBottomSheetRef } from "src/sharedModule"

@Directive({
  selector: '[volubaBottomSheet]',
  exportAs: 'volubaBottomSheet',
})

export class BottomSheetDirective {
  
  @Input('bottom-sheet-template')
  tmpl: TemplateRef<any>|undefined

  #bottomSheetRef: MatBottomSheetRef|undefined

  constructor(private bottomSheet: MatBottomSheet){}

  @HostListener('click')
  onClick(){
    if (!!this.#bottomSheetRef) {
      this.#bottomSheetRef.dismiss()
      return
    }
    if (!this.tmpl) {
      console.error(`templateref needs to be defined`)
      return
    }
    this.#bottomSheetRef = this.bottomSheet.open(this.tmpl)

    this.#bottomSheetRef.afterDismissed().subscribe(() => {
      this.#bottomSheetRef = undefined
    })
  }
}
