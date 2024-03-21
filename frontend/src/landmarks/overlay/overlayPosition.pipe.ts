import { Pipe, PipeTransform, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: 'overlayPosition',
  pure: true
})

export class OverlayPositionPipe implements PipeTransform{
  constructor(private sanitizer: DomSanitizer){}
  transform(position: number[]) {
    return this.sanitizer.sanitize(
      SecurityContext.STYLE, `translate(${position[0]}px, ${position[1]}px)`
    )
  }
}
