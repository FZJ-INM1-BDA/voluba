import { Directive, HostListener, Input } from "@angular/core";

const textEncoder = new TextEncoder()

@Directive({
  selector: '[voluba-save-to-file]',
  exportAs: 'volubaSaveToFile'
})

export class SaveToFileDirective{
  @Input('to-file-content')
  textToSave: string|undefined

  @Input('to-file-filename')
  filename: string = 'savedFile.json'

  @Input('to-file-mimetype')
  mimetype: string = 'application/json'

  @HostListener('click')
  onClick(){
    const { mimetype, filename, textToSave } = this
    const blob = new Blob([ textEncoder.encode(textToSave) || ''], {type: mimetype})
    const _url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', _url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
  
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
