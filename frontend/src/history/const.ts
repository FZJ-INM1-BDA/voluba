import { State } from 'src/state'
import { Injectable } from '@angular/core'
import { Store } from '@ngrx/store'
import { Subject, firstValueFrom, map, merge, scan, shareReplay, withLatestFrom } from 'rxjs'
import * as generalAction from "src/state/actions"

export type HistoryStack = {
  id: string
  name: string
  state: State
  active: boolean
}

@Injectable()
export class UndoService {

  static MAX_STACK = 100

  #pushUndo$ = new Subject<{name:string,standalone?:boolean}>()
  #activateUuid$ = new Subject<string>()

  undoStack$ = merge(
    this.#pushUndo$.pipe(
      map(push => ({ push, activate: null }))
    ),
    this.#activateUuid$.pipe(
      map(activate => ({ push: null, activate }))
    )
  ).pipe(
    withLatestFrom(
      this.store,
    ),
    scan((acc, curr) => {
      const [ { push, activate }, state ] = curr
      if (!!activate) {
        return acc.map(v => {
          if (v.id !== activate) {
            return {
              ...v,
              active: false
            }
          }
          return {
            ...v,
            active: true
          }
        })
      }
      if (!!push) {
        const { name, standalone } = push
        const currentActiveIndex = acc.findIndex(v => v.active)
        acc = acc.slice(0, currentActiveIndex + 1)
        const last = acc.at(-1)
        
        if (last?.name === name && !standalone) {
          last.state = state as State
          return acc
        }
        const newVal = {
          id: crypto.randomUUID(),
          name,
          state: state as State,
          active: true
        }
        acc = acc.map(v => ({
          ...v,
          active: false
        }))

        if (acc.length > UndoService.MAX_STACK) {
          return acc
            .slice(acc.length - UndoService.MAX_STACK)
            .concat(newVal)
        }
        return acc.concat(newVal)
      }
      console.error(`both push and activate are falsy`)
      return acc

    }, [] as HistoryStack[]),
    shareReplay(1),
  )

  async resetTo(uuid: string) {
    /**
     * nb, cannot subscribe to this.undoStack$, as
     * 1/ if apply all updates, will dispatch multiple redundant applyState calls
     * 2/ if ignore if last stack is selected, then cannot correctly catch when the last stack is selected
     * (e.g. select 2nd, then select last)
     */
    this.#activateUuid$.next(uuid)
    const stack = await firstValueFrom(
      this.undoStack$
    )
    
    const activeLayer = stack.find(layer => layer.id === uuid)
    if (!activeLayer) {
      console.error(`No stack is active, this shouldn't happen.`)
      return
    }
    this.store.dispatch(
      generalAction.appplyState({
        state: { ...activeLayer.state }
      })
    )
  }

  async rewind() {
    const stack = await firstValueFrom(
      this.undoStack$
    )
    const currentActiveIndex = stack.findIndex(s => !!s.active)
    const needId = stack[currentActiveIndex - 1]?.id
    if (!needId) {
      console.error(`Cannot rewind. ${currentActiveIndex} is the index of active stack`)
      return
    }
    this.resetTo(needId)
  }

  async forward() {
    const stack = await firstValueFrom(
      this.undoStack$
    )
    const currentActiveIndex = stack.findIndex(s => !!s.active)
    const needId = stack[currentActiveIndex + 1]?.id
    if (!needId) {
      console.error(`Cannot rewind. ${currentActiveIndex} is the index of active stack`)
      return
    }
    this.resetTo(needId)
  }

  pushUndo(name: string, standalone:boolean=false) {
    this.#pushUndo$.next({ name, standalone })
  }

  constructor(private store: Store){
    this.undoStack$.subscribe()
  }
}
