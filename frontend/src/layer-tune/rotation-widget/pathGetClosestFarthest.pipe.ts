import { Pipe, PipeTransform } from "@angular/core";
import { SvgPath } from "./consts";

@Pipe({
  name: 'getClosestFurtherest',
  pure: true
})

export class GetClosestFurtherestPipe implements PipeTransform{
  transform(value: SvgPath) {
    const arr = value.path.map(p => p.coords).flatMap(v => v).filter(v => !!v)
    const sorted = arr.map((coord, idx) => {
      return {
        z: coord[2],
        idx,
      }
    })
    sorted.sort((a, b) => a.z - b.z)
    const sortedIdx = sorted[0].idx

    return {
      closest: arr[sortedIdx],
      furthest: arr[(sortedIdx + 7) % arr.length]
    }
  }
}
