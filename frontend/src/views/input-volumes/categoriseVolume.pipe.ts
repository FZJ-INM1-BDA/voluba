import { Pipe, PipeTransform } from "@angular/core";
import { TVolume } from "src/state/inputs/consts";

@Pipe({
  name: 'categoriseVolume',
  pure: true,
})

export class CategoriseVolumePipe implements PipeTransform{
  transform(volumes: TVolume[]): Record<string, TVolume[]> {
    const returnVal: Record<string, TVolume[]> = {}
    for (const volume of volumes){
      const label = volume.visibility || "Other"
      if (!returnVal[label]) {
        returnVal[label] = []
      }
      returnVal[label].push(volume)
    }

    return returnVal
  }
}
