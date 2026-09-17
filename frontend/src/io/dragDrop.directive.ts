import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, inject } from "@angular/core";
import { fromEvent, merge, Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, map, scan, switchMap, takeUntil } from "rxjs/operators";
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "src/sharedModule"
import { DestroyDirective } from "src/util/destroy.directive";

@Directive({
  selector: '[drag-drop-file]',
  exportAs: 'dragDropFile',
  hostDirectives: [
    DestroyDirective
  ]
})

export class DragDropFileDirective {

  destroyed$ = inject(DestroyDirective).destroyed$

  @Input()
  public snackText: string|undefined

  @Output('drag-drop-file')
  public dragDropOnDrop: EventEmitter<File[]> = new EventEmitter()

  @HostBinding('style.transition')
  public transition = `opacity 300ms ease-in`

  @HostBinding('style.opacity')
  public hostOpacity: number = 0.5

  get opacity() {
    return this.hostOpacity
  }

  @Input('drag-drop-file-opacity')
  set opacity(val: number) {
    this.hostOpacity = val
    this.cdr.markForCheck()
  }

  public snackbarRef: MatSnackBarRef<SimpleSnackBar>|undefined

  private dragover$: Observable<boolean>

  @HostListener('dragover', ['$event'])
  public ondragover(ev: DragEvent) {
    ev.preventDefault()
  }

  @HostListener('drop', ['$event'])
  public ondrop(ev: DragEvent) {
    ev.preventDefault()
    this.reset()

    this.dragDropOnDrop.emit(Array.from(ev?.dataTransfer?.files || []))
  }

  public reset() {
    if (this.snackbarRef) {
      this.snackbarRef.dismiss()
    }
    this.snackbarRef = undefined
    this.opacity = 0.5
  }

  constructor(private snackBar: MatSnackBar, private el: ElementRef, private cdr: ChangeDetectorRef) {
    this.dragover$ = merge(
      of(null),
      fromEvent(this.el.nativeElement, 'drop'),
    ).pipe(
      switchMap(() => merge(
        fromEvent(this.el.nativeElement, 'dragenter').pipe(
          map(() => 1),
        ),
        fromEvent(this.el.nativeElement, 'dragleave').pipe(
          map(() => -1),
        ),
      ).pipe(
        scan((acc, curr) => acc + curr, 0),
        map(val => val > 0),
      )),
    )

    this.dragover$.pipe(
      takeUntil(this.destroyed$),
      debounceTime(16),
      distinctUntilChanged(),
    ).subscribe(flag => {
      if (flag) {
        this.snackbarRef = this.snackBar.open(
          this.snackText || `Drop file(s) here.`, 'Dismiss',
          {
            panelClass: 'sxplr-pe-none'
          }
        )

        /**
         * In buggy scenarios, user could at least dismiss by action
         */
        this.snackbarRef.afterDismissed().subscribe(reason => {
          if (reason.dismissedByAction) {
            this.reset()
          }
        })
        this.opacity = 0.2
      } else {
        this.reset()
      }
    })
  }
}
