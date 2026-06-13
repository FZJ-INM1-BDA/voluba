import { Pipe, PipeTransform, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: 'overlayStemStyle',
  pure: true
})

export class OverlayStemStylePipe implements PipeTransform{
  constructor(private sanitizer: DomSanitizer){

  }
  transform(landmark: {color: string, position: number[]}) {
    return this.sanitizer.sanitize(
      SecurityContext.STYLE,
      {
        height: `${Math.abs(landmark.position[2])}px`,
        backgroundColor: landmark.color,
        order: landmark.position[2] < 0 ? -1 : 0
      }
    )
  }
}
