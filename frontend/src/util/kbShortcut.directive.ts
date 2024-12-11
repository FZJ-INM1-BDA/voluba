import { Directive, EventEmitter, HostListener, Input, Output } from "@angular/core";

type Modifier = 'ctrl' | 'shift' | 'alt'
type ModifierKey = `${Modifier}Key`
type Key = 'Escape' | 'Enter' | `key${string}`
type KeyType = `${Modifier}+${Key}` | Key

function parseKeyType(input: string): {mod?: Modifier, key: Key}|undefined|null {
  if (input.indexOf("+") > 0) {
    if (input.split("+").length !== 2) {
      return null
    }
    const [ mod, key ] = input.split("+")
    if (!["ctrl", "shift", "alt"].includes(mod)) {
      return null
    }
    const parsedKey = parseKeyType(key)?.key
    
    return parsedKey && {
      mod: mod as Modifier,
      key: parsedKey,
    }
  }
  if (['Escape', 'Enter'].includes(input)) {
    return {
      key: input as 'Escape' | 'Enter'
    }
  }
  if (!input.startsWith("key")) {
    return null
  }
  if (input.length !== 4) {
    return null
  }
  if (!/[a-z]/.test(input[3])) {
    return null
  }
  return {
    key: input as `key${string}`
  }

}

@Directive({
  selector: '[voluba-kb-shortcut]',
  exportAs: 'VolubaKbShortcut',
  standalone: true,
})
export class VolubaKeyboardShortcutDirective {

  parseKeys(keys: string){
    const returnArray: {mod?: Modifier, key: Key}[] = []
    for (const key of keys.split(",")){
      const parsedKeyType = parseKeyType(key)
      if (!parsedKeyType) {
        console.warn(`${key} cannot be properly parsed as key`)
        continue
      }
      returnArray.push(parsedKeyType)
    }
    return returnArray
  }

  #modKeys: {mod?: Modifier, key: Key}[] = []

  @Input('kb-shortcut-keys')
  set keys(keys: string) {
    this.#modKeys = this.parseKeys(keys)
  }

  @Output('kb-shortcut-triggered')
  triggered = new EventEmitter<KeyboardEvent>()

  @HostListener("window:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent){
    
    for (const modkey of this.#modKeys){
      const mod: ModifierKey|undefined = modkey.mod && `${modkey.mod}Key`
      if (mod && !event[mod]) {
        continue
      }
      if (["Escape", "Enter"].includes(modkey.key) && modkey.key === event.key) {
        this.triggered.emit(event)
        break
      }
      if (modkey.key[3] === event.key) {
        this.triggered.emit(event)
        break
      }
    }
  }

}
