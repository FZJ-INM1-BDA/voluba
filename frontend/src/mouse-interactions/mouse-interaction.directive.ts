import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  inject,
} from '@angular/core';
import { filter, map, Subject, switchMap, takeUntil } from 'rxjs';
import { DestroyDirective } from 'src/util/destroy.directive';

type SupportedEvents =
  | 'mousedown'
  | 'mouseup'
  | 'click'
  | 'mousemove'
  | 'wheel';
type _Subject<T extends SupportedEvents> = Subject<{
  eventname: T;
  event: GlobalEventHandlersEventMap[T];
}>;

@Directive({
  selector: '[volubaMouseInteraction]',
  hostDirectives: [
    DestroyDirective
  ],
  standalone: true
})
export class MouseInteractionDirective implements AfterViewInit {

  destroyed$ = inject(DestroyDirective).destroyed$

  @Input()
  ignoreElements: { has(el: HTMLElement): boolean } | null = null

  @Input()
  onlyElements: { has(el: HTMLElement): boolean } | null = null

  @Input()
  stopPropagation = false;

/**
 * on the one hand, the mousemove even needs to be bubbled,  so mouseover.inVoxel will be triggered
 * on the other, we need to prevent user interaction with the actual canvas
 */
  stopPropagationEvents: SupportedEvents[] = ["mousedown", "mouseup"]

  #htmlEl: HTMLElement | null = null;
  #eventSubject: _Subject<SupportedEvents> = new Subject();

  constructor(private el: ElementRef) {}

  @Output()
  volubaDrag = new EventEmitter<{ movementX: number; movementY: number }>();

  @Output()
  mousedown = new EventEmitter<{ event: MouseEvent }>()

  @Output()
  mouseup = new EventEmitter<{ event: MouseEvent }>()

  ngAfterViewInit(): void {
    this.#htmlEl = this.el.nativeElement as HTMLElement

    this.#getEventStream('mousedown').pipe(
      switchMap(() =>
        this.#getEventStream('mousemove').pipe(
          takeUntil(this.#getEventStream('mouseup'))
        )
      ),
      takeUntil(this.destroyed$),
    )
    .subscribe((ev) => {
      const { movementX, movementY } = ev;
      this.volubaDrag.emit({ movementX, movementY });
    })
    this.#getEventStream('mousedown').pipe(
      takeUntil(this.destroyed$),
    ).subscribe(event => this.mousedown.emit({ event }))

    this.#getEventStream("mouseup").pipe(
      takeUntil(this.destroyed$),
    ).subscribe(event => this.mouseup.emit({ event }))
  }

  #eventsHandled = new Set<SupportedEvents>();

  #getEventStream<T extends SupportedEvents>(eventname: T) {
    if (!this.#eventsHandled.has(eventname)) {
      const evh = (event: GlobalEventHandlersEventMap[T]) => {
        if (this.ignoreElements
          && this.ignoreElements.has(event.target as HTMLElement)) {
          return
        }

        if (this.onlyElements
          && !this.onlyElements.has(event.target as HTMLElement)) {
          return
        }

        if (this.stopPropagation && this.stopPropagationEvents.includes(eventname)) {
          event.stopPropagation();
        }
        this.#eventSubject.next({ eventname, event });
      }
      this.#htmlEl?.addEventListener(eventname, evh, {
        capture: true,
      })

      this.destroyed$.subscribe(() => {
        this.#htmlEl?.removeEventListener(eventname, evh, {
          capture: true,
        })
      })
      this.#eventsHandled.add(eventname)
    }
    return this.#eventSubject.pipe(
      filter((ev) => ev.eventname === eventname),
      map((ev) => ev.event)
    );
  }
}
