import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'displayNumArray',
  pure: true
})

export class DisplayNumArrayPipe implements PipeTransform{
  transform(input: Float32Array|(number[]), unit: string='', scale:number=1e-6, sigfig:number=3): string {
    if (input instanceof Float32Array){
      input = Array.from(input)
    }
    return input
      .map(v => `${(v * scale).toFixed(sigfig)}${unit}`)
      .join(' ')
  }
}
