import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injectable,
  ViewChild,
  inject,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  combineLatest,
  map,
  filter,
  Observable,
  switchMap,
  withLatestFrom,
  Subject,
  takeUntil,
  NEVER,
} from 'rxjs';
import { MouseInteractionDirective } from 'src/mouse-interactions/mouse-interaction.directive';
import * as app from 'src/state/app';
import * as outputs from 'src/state/outputs';
import { NehubaViewerWrapperComponent } from '../nehuba-viewer-wrapper/nehuba-viewer-wrapper.component';
import { VOLUBA_NEHUBA_TOKEN } from 'src/const';
import { DestroyDirective } from 'src/util/destroy.directive';

@Injectable()
class NehubaSvc {
  #mouseover = new Subject<Float32Array>()
  #mousedown = new Subject<MouseEvent>()

  mouseover = this.#mouseover.asObservable()
  mousedown = this.#mousedown.asObservable()

  setMouseOver(val: Float32Array){
    this.#mouseover.next(val)
  }
  setMouseDown(ev: MouseEvent) {
    this.#mousedown.next(ev)
  }
}

@Component({
  selector: 'voluba-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    NehubaSvc,
    {
      provide: VOLUBA_NEHUBA_TOKEN,
      useFactory: (svc: NehubaSvc) => {
        return svc
      },
      deps: [ NehubaSvc ]
    }
  ],
  hostDirectives: [
    DestroyDirective
  ]
})
export class ViewerComponent implements AfterViewInit {

  #destroyed$ = inject(DestroyDirective).destroyed$

  @ViewChild(NehubaViewerWrapperComponent)
  viewerWrapper: NehubaViewerWrapperComponent | undefined;

  @ViewChild(MouseInteractionDirective)
  mouseInteractive: MouseInteractionDirective | undefined;

  public incLocked$ = this.store.pipe(select(app.selectors.incLocked));

  view$ = combineLatest([
    this.incLocked$,
    this.store.pipe(
      select(app.selectors.isDefaultMode)
    )
  ]).pipe(
    map(([incLocked, isDefaultMode]) => ({
      incLocked, isDefaultMode
    }))
  );

  toggleIncLocked() {
    this.store.dispatch(app.actions.toggleIncLocked());
  }

  toggleMode() {
    this.store.dispatch(app.actions.toggleMode())
  }

  constructor(private store: Store, private nehubaSvc: NehubaSvc) {}

  onMousePosition(pos: Float32Array){
    this.nehubaSvc.setMouseOver(pos)
  }

  onMouseDown(ev: MouseEvent) {
    this.nehubaSvc.setMouseDown(ev)
  }

  ngAfterViewInit(): void {
    if (!this.mouseInteractive) {
      throw new Error(`Cannot find mouse interactive directive`);
    }
    if (!this.viewerWrapper) {
      throw new Error(`Cannot find viewer wrapper module`);
    }

    const dragOnIncVol$: Observable<{
      movementX: number;
      movementY: number;
      sliceView: export_nehuba.SliceView;
      mouseDownEvent: MouseEvent;
    } | null> = this.viewerWrapper.mousedownSliceView.pipe(
      switchMap(({ sliceView, event }) => {
        if (!sliceView || !this.mouseInteractive) {
          return NEVER
        }
        return combineLatest([
          this.incLocked$,
          this.store.pipe(
            select(app.selectors.addLmMode)
          ),
          this.mouseInteractive.volubaDrag,
          
        ]).pipe(
          filter(([incLocked, isAddingLm, _]) => !incLocked && !isAddingLm),
          map(([_, _2, { movementX, movementY }]) => ({
            movementX,
            movementY,
            sliceView,
            mouseDownEvent: event,
          }))
        )
      })
    );

    dragOnIncVol$.pipe(
      filter((v) => !!v && !v.mouseDownEvent.shiftKey),
      withLatestFrom(this.store.pipe(select(outputs.selectors.incMatrixMat4))),
      takeUntil(this.#destroyed$),
    ).subscribe(([val, xformMat]) => {
      if (!val) return;
      const { movementX, movementY, sliceView } = val;

      const { vec3, mat4 } = export_nehuba;

      const pos = vec3.fromValues(movementX, movementY, 0);

      vec3.transformMat4(pos, pos, sliceView.invViewMatrix);
      vec3.sub(pos, pos, sliceView.centerDataPosition);

      const prevTranslVec = mat4.getTranslation(vec3.create(), xformMat);
      /**
       * add delta & set xformMat
       */
      vec3.add(pos, pos, prevTranslVec);

      this.store.dispatch(
        outputs.actions.setIncTranslation({
          array: Array.from(pos),
        })
      );
    });

    dragOnIncVol$.pipe(
      filter((v) => !!v && v.mouseDownEvent.shiftKey),
      takeUntil(this.#destroyed$),
    ).subscribe((val) => {
      if (!val) return;

      const { vec3, quat } = export_nehuba;
      const { movementX, movementY, sliceView } = val;
      const { orientation } = sliceView.navigationState.pose.orientation;

      /**
       * TODO
       * fix the rotation
       * couldn't get the angle right
       */
      const axes0 = vec3.fromValues(0, -1, 0);
      const axes1 = vec3.fromValues(1, 0, 0);
      /**
       * 0 0 1
       * 1 0 0
       * 
       * -1 0 0
       * 0 0 -1
       * 
       * 0 -1 0
       * 1 0 0 
       */

      vec3.transformQuat(axes0, axes0, orientation);
      vec3.transformQuat(axes1, axes1, orientation);

      /**
       * TODO add viewer rotation state
       */

      const finalRotation = quat.create();

      quat.mul(
        finalRotation,
        quat.setAxisAngle(quat.create(), axes0, (-movementX * Math.PI) / 180),
        quat.setAxisAngle(quat.create(), axes1, (movementY * Math.PI) / 180)
      );

      this.store.dispatch(
        outputs.actions.rotateIncBy({
          array: Array.from(finalRotation),
        })
      );
    });


    const applyMatrixSub = this.store
      .pipe(select(outputs.selectors.incMatrixMat4))
      .subscribe((v) => {
        this.viewerWrapper?.setLayerProperty('bla', {
          transform: v,
        });
      });
  }
}
