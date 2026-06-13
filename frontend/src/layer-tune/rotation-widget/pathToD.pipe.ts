import { Pipe, PipeTransform } from "@angular/core";
import { SvgPath } from "./consts";

@Pipe({
  name: 'pathToD',
  pure: true
})

export class SvgPathToDPipe implements PipeTransform{
  transform(value: SvgPath): string[] {
    return value.path.map(obj => {
      const coordStr = obj.coords.map(coord => coord.slice(0, 2)).join(" ")
      return `${obj.type}${coordStr}`
    })
  }
}
