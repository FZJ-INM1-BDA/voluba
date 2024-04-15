import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
  selector: 'input[type="number"][scrollable]'
})

export class ScrollableInput {

  @HostListener("wheel", ["$event"])
  onWheel(event: WheelEvent) {
    
    const currentValue = (this.el.nativeElement as HTMLInputElement).value
    const newVal = Number(currentValue) + (event.deltaY * this.scrollableStep)
    const _ = (this.el.nativeElement as HTMLInputElement).value = newVal.toString()
  }

  @Input('scrollable-step')
  scrollableStep: number = 1

  constructor(private el: ElementRef){

  }
}