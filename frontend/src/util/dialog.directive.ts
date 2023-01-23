import { Directive, HostListener, Input, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { isHtmlElement } from 'src/const';

@Directive({
  selector: '[volubaDialog]',
})
export class DialogDirective {
  @Input()
  dialogTarget: TemplateRef<unknown> | null = null;

  #matDialogRef: MatDialogRef<unknown> | null = null;

  @HostListener('click', ['$event'])
  click(event: MouseEvent) {
    if (!this.dialogTarget) return;
    this.close();

    const { target } = event;
    let top, left;
    if (isHtmlElement(target)) {
      const rect = target.getBoundingClientRect();
      top = rect.top;
      left = rect.right + 20;
    }
    this.#matDialogRef = this.dialog.open(this.dialogTarget, {
      hasBackdrop: false,
      position: {
        left: `${left}px`,
        top: `${top}px`,
      },
    });
  }

  close() {
    if (this.#matDialogRef) this.#matDialogRef.close();
    this.#matDialogRef = null;
  }

  constructor(private dialog: MatDialog) {}
}
