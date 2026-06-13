import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, inject, Output, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { BehaviorSubject, combineLatest, concat, debounceTime, filter, interval, map, Observable, of, pairwise, Subject, take, throttleTime, timer } from "rxjs";
import { DEBOUNCED_WINDOW_RESIZE } from "src/const";
import { SharedModule } from "src/sharedModule/sharedModule";

type Pos = [number, number]

@Component({
  selector: 'dial-cmp',
  templateUrl: './dial.template.html',
  styleUrls: [
    './dial.style.scss'
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialCmp {

  mouseover = new BehaviorSubject<boolean>(false)
  #mousedown = new BehaviorSubject<boolean>(false)
  #currMousePos = new BehaviorSubject<Pos|null>(null)

  @HostListener('mouseover', ['$event'])
  onmouseover(event: MouseEvent){
    this.mouseover.next(true)
    this.#currMousePos.next([event.clientX, event.clientY])
  }
  
  @HostListener('wheel', ['$event'])
  onwheel(event: WheelEvent){
    this.wheelEvent.next(event)
  }

  @HostListener('window:mousemove', ['$event'])
  onmousemove(event: MouseEvent){
    this.#currMousePos.next([event.clientX, event.clientY])
  }

  @HostListener('mouseout')
  onmouseout(){
    this.mouseover.next(false)
  }

  @HostListener('mousedown')
  onmousedown(){
    this.#mousedown.next(true)
  }

  @HostListener('window:mouseup')
  onmouseup(){
    this.#mousedown.next(false)
  }

  @Output('dial-cmp-mouseover')
  mouseoverEvent = this.mouseover.pipe()

  @Output('dial-cmp-onwheel')
  wheelEvent = new Subject<WheelEvent>()

  #calculateRect$ = concat(
    of(this.#getRect()),
    interval(160).pipe(
      map(() => this.#getRect()),
      filter(rect => rect.width !== 0 && rect.height !== 0),
      take(1),
    ),
    this.windowResize$.pipe(
      debounceTime(160),
      map(() => this.#getRect())
    ),
  )

  view$ = combineLatest([
    this.mouseover,
    this.#currMousePos,
    this.#mousedown,
    this.#calculateRect$,
  ]).pipe(
    map(([ mouseover, currMousePos, mousedown, rect ]) => {
      let transformRotateStr = this.sanitizer.sanitize(SecurityContext.STYLE, `rotate(0deg)`)
      let angle = 0
      if ((mousedown || mouseover) && currMousePos && rect !== null) {
        const { x, y, width, height } = rect
        // DOM position is calculated from top left corner. 
        // so y displacement is inversed
        const normalizedXY = [y + (height / 2) - currMousePos[1], currMousePos[0] - x - (width / 2)]
        angle = Math.atan2(normalizedXY[1], normalizedXY[0]) / Math.PI * 180
        transformRotateStr = this.sanitizer.sanitize(SecurityContext.STYLE, `rotate(${angle + 45}deg)`)
      }
      return {
        mouseover,
        transformRotateStr,
        angle,
        mousedown,
      }
    })
  )
  
  @Output('dial-cmp-ondial')
  ondial = this.view$.pipe(
    filter(({ mousedown }) => mousedown),
    map(v => v.angle),
    throttleTime(16),
    pairwise(),
    map(([ o, n ]) => n - o)
  )

  // expensive operation, call as little as possible
  #getRect(){
    console.log("get rect")
    return (this.el.nativeElement as HTMLElement).getBoundingClientRect()
  }

  constructor(
    private el: ElementRef,
    private sanitizer: DomSanitizer, 
    @Inject(DEBOUNCED_WINDOW_RESIZE) private windowResize$: Observable<UIEvent>,
  ){
  }
}
