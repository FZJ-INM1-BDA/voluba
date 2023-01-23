import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { filter, fromEvent, map, Subject, switchMap, takeUntil } from 'rxjs';

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
})
export class MouseInteractionDirective implements OnDestroy, AfterViewInit {
  @Input()
  stopPropagation = false;

  #htmlEl: HTMLElement | null = null;
  #eventSubject: _Subject<SupportedEvents> = new Subject();

  constructor(private el: ElementRef) {}

  @Output()
  volubaDrag = new EventEmitter<{ movementX: number; movementY: number }>();

  ngAfterViewInit(): void {
    this.#htmlEl = this.el.nativeElement as HTMLElement;

    const subscription = this.#getEventStream('mousedown')
      .pipe(
        switchMap(() =>
          this.#getEventStream('mousemove').pipe(
            takeUntil(this.#getEventStream('mouseup'))
          )
        )
      )
      .subscribe((ev) => {
        const { movementX, movementY } = ev;
        this.volubaDrag.emit({ movementX, movementY });
      });

    this.#onDestroyCb.push(() => subscription.unsubscribe());
  }

  #onDestroyCb: (() => void)[] = [];
  ngOnDestroy(): void {
    while (this.#onDestroyCb.length) this.#onDestroyCb.pop()!();
  }

  #eventsHandled = new Set<SupportedEvents>();

  #getEventStream<T extends SupportedEvents>(eventname: T) {
    if (!this.#eventsHandled.has(eventname)) {
      const evh = (event: GlobalEventHandlersEventMap[T]) => {
        if (this.stopPropagation) {
          event.stopPropagation();
        }
        this.#eventSubject.next({ eventname, event });
      };
      this.#htmlEl?.addEventListener(eventname, evh, {
        capture: true,
      });
      this.#onDestroyCb.push(() =>
        this.#htmlEl?.removeEventListener(eventname, evh, {
          capture: true,
        })
      );
      this.#eventsHandled.add(eventname);
    }
    return this.#eventSubject.pipe(
      filter((ev) => ev.eventname === eventname),
      map((ev) => ev.event)
    );
  }
}
