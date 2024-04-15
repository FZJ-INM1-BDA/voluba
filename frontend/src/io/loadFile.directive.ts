import { Directive, EventEmitter, HostListener, Input, Output } from "@angular/core";

@Directive({
  selector: '[voluba-load-from-file]',
  exportAs: 'volubaLoadFromFile',
})

export class LoadFromFileDirective {
  @Input('from-file-extensions')
  extensionsToLoad: string = '.json'

  @Output('from-file-content')
  emitContent = new EventEmitter<string>()

  @HostListener('click')
  load(){
    const input = document.createElement("input")
    input.type = 'file'
    input.accept = this.extensionsToLoad
    document.body.appendChild(input)
    input.onchange = () => {
      if (input.files?.length !== 1) {
        throw new Error(`Expected one and only one file selected, but got ${input.files?.length}`)
      }
      const file = input.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        const out = reader.result
        if (!out) throw new Error(`Could not get any content!`)
        this.emitContent.emit(out as string)
      }
      reader.onerror = e => { throw e }
      reader.readAsText(file, 'utf-8')
      
      document.body.removeChild(input)
    }
    input.click()
  }
}
