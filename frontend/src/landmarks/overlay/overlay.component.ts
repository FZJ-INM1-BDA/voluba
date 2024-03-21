import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { Landmark } from '../const';
import { BehaviorSubject, Observable, Subject, combineLatest, concat, debounceTime, filter, map, merge, of, pipe, share, shareReplay, switchMap, tap, throttleTime } from 'rxjs';
import { DEBOUNCED_WINDOW_RESIZE } from 'src/const';
import { Store, select } from '@ngrx/store';
import * as appState from "src/state/app"

function isSliceView(input: export_nehuba.SliceView|null): input is export_nehuba.SliceView {
  return !!input
}

export type OverlayLm = Landmark & { color: string }


/**
 * 
 * TODO
 * might not be efficient/mem leak?
 */
const pipeGetSliceViewChanged = () => {
  let cancel: (() => void) | null = null
  let viewChanged$: Subject<null> | null = null
  return pipe(
    switchMap((sliceView: export_nehuba.SliceView) => {
      if (cancel) {
        cancel()
        cancel = null
      }
      if (viewChanged$) {
        viewChanged$.complete()
        viewChanged$ = null
      }
      viewChanged$ = new Subject()
      cancel = sliceView.viewChanged.add(
        () => {
          viewChanged$?.next(null)
        }
      )
      return viewChanged$.asObservable()
    })
  )
}

@Component({
  selector: 'voluba-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverlayComponent {

  #sliceView$ = new BehaviorSubject<export_nehuba.SliceView|null>(null)
  #sliceViewObs$: Observable<export_nehuba.SliceView> = this.#sliceView$.pipe(
    filter(isSliceView),
    shareReplay(1)
  )

  @Input('overlay-sliceview')
  set sliceView(sv: export_nehuba.SliceView) {
    this.#sliceView$.next(sv)
  }

  #landmarks$ = new BehaviorSubject<OverlayLm[]>([])
  #landmarkObs$ = this.#landmarks$.pipe(
    shareReplay(1)
  )

  @Input('overlay-landmarks')
  set landmarks(lms: OverlayLm[]) {
    this.#landmarks$.next(lms)
  }

  #sliceViewInfo$ = combineLatest([
    concat(
      of(null),
      merge(
        this.dbResize,
        this.store.pipe(
          select(appState.selectors.isDefaultMode),
        )
      )
    ).pipe(
      debounceTime(32)
    ),
    this.#sliceViewObs$,
  ]).pipe(
    map(([_, sliceView]) => {
      const { width, height } = sliceView
      return {
        sliceView,
        width,
        height,
      }
    }),
    shareReplay(1),
  )

  #sliceViewChanged$ = this.#sliceViewObs$.pipe(
    pipeGetSliceViewChanged(),
    throttleTime(16),
  )


  /**
   * displayedLandmarks, unlike regularlandmarks, the xyz position
   * has been transformed to the slice view space (in terms of x, y
   * from top left of the slice view)
   */
  displayedLandmarks$ = combineLatest([
    concat(
      of(null),
      this.#sliceViewChanged$,
    ),
    this.#sliceViewInfo$,
    this.#landmarkObs$,
  ]).pipe(
    map(([_sliceViewChanged, sliceViewInfo, landmarks]) => {
      const { vec3 } = export_nehuba
      const { width, height, sliceView: { viewMatrix } } = sliceViewInfo
      return landmarks.map(lm => {
        const newPos = vec3.transformMat4(vec3.create(), lm.position as any, viewMatrix)
        newPos[0] = (newPos[0] + width / 2)
        newPos[1] = (newPos[1] + height / 2)
        return {
          ...lm,
          position: Array.from(newPos)
        }
      }).filter(lm => {
        return (
          lm.position[0] >= 0 && lm.position[0] <= width
          && lm.position[1] >= 0 && lm.position[1] <= height
        )
      })
    }),
    shareReplay(1),
  )
  
  constructor(
    @Inject(DEBOUNCED_WINDOW_RESIZE)
    private dbResize: Observable<UIEvent>,
    private store: Store,
  ){
    this.#sliceViewChanged$.subscribe(val => {
      console.log("view changed", val)
    })
  }
}
