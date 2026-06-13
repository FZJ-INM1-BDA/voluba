import { Directive, HostListener, Input, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { isHtmlElement } from 'src/const';

@Directive({
  selector: '[volubaDialog]',
  exportAs: 'volubaDialog'
})
export class DialogDirective {

  #state$ = new BehaviorSubject<boolean>(false)
  state$ = this.#state$.asObservable()

  @Input()
  clickToToggle: boolean = true

  @Input()
  dialogTarget: TemplateRef<unknown> | null = null;

  @Input()
  dialogCentered = false

  @Input()
  dialogBackdrop = false

  #matDialogRef: MatDialogRef<unknown> | null = null;

  

  @HostListener('click', ['$event'])
  click(event: MouseEvent) {
    if (this.clickToToggle) {
      this.toggle(event)
      return
    }

    this.open(event)
  }

  toggle(event: MouseEvent) {
    if (this.#matDialogRef) {
      this.close()
    } else {
      this.open(event)
    }
  }

  open(event: MouseEvent) {
    if (!this.dialogTarget) return

    const cfg: Partial<MatDialogConfig> = {}
    cfg.hasBackdrop = this.dialogBackdrop
    if (!this.dialogCentered) {
      const { target } = event;
      let top, left;
      if (isHtmlElement(target)) {
        const rect = target.getBoundingClientRect();
        top = rect.top;
        left = rect.right + 20;
        cfg.position = {
          left: `${left}px`,
          top: `${top}px`,
        }
      }
    }
    this.#matDialogRef = this.dialog.open(this.dialogTarget, cfg)
    this.#matDialogRef.afterClosed().subscribe(() => {
      this.#state$.next(false)
      this.#matDialogRef = null
    })
    this.#state$.next(true)
  }

  close() {
    if (this.#matDialogRef) this.#matDialogRef.close();
    this.#matDialogRef = null;
  }

  constructor(private dialog: MatDialog) {}
}
