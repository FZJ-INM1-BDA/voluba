import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  combineLatest,
  map,
  filter,
  Observable,
  of,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { MouseInteractionDirective } from 'src/mouse-interactions/mouse-interaction.directive';
import * as app from 'src/state/app';
import * as outputs from 'src/state/outputs';
import { NehubaViewerWrapperComponent } from '../nehuba-viewer-wrapper/nehuba-viewer-wrapper.component';

@Component({
  selector: 'voluba-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild(NehubaViewerWrapperComponent)
  viewerWrapper: NehubaViewerWrapperComponent | undefined;

  @ViewChild(MouseInteractionDirective)
  mouseInteractive: MouseInteractionDirective | undefined;

  public incLocked$ = this.store.pipe(select(app.selectors.incLocked));

  view$ = combineLatest([this.incLocked$]).pipe(
    map(([incLocked]) => ({
      incLocked,
    }))
  );

  toggleIncLocked() {
    this.store.dispatch(app.actions.toggleIncLocked());
  }

  constructor(private store: Store) {}

  #onDestroyCb: (() => void)[] = [];
  ngOnDestroy(): void {
    while (this.#onDestroyCb.length > 0) this.#onDestroyCb.pop()!();
  }

  ngAfterViewInit(): void {
    if (!this.mouseInteractive)
      throw new Error(`Cannot find mouse interactive directive`);
    if (!this.viewerWrapper)
      throw new Error(`Cannot find viewer wrapper module`);

    const dragOnIncVol$: Observable<{
      movementX: number;
      movementY: number;
      sliceView: export_nehuba.SliceView;
      mouseDownEvent: MouseEvent;
    } | null> = this.viewerWrapper.mousedownSliceView.pipe(
      switchMap(({ sliceView, event }) =>
        sliceView && this.mouseInteractive
          ? combineLatest([
              this.incLocked$,
              this.mouseInteractive.volubaDrag,
            ]).pipe(
              filter(([incLocked, _]) => !incLocked),
              map(([_, { movementX, movementY }]) => ({
                movementX,
                movementY,
                sliceView,
                mouseDownEvent: event,
              }))
            )
          : of(null)
      )
    );

    const translationSubscription = dragOnIncVol$
      .pipe(
        filter((v) => !!v && !v.mouseDownEvent.shiftKey),
        withLatestFrom(this.store.pipe(select(outputs.selectors.incMatrixMat4)))
      )
      .subscribe(([val, xformMat]) => {
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

    const rotationSubscription = dragOnIncVol$
      .pipe(filter((v) => !!v && v.mouseDownEvent.shiftKey))
      .subscribe((val) => {
        if (!val) return;

        const { vec3, quat } = export_nehuba;
        const { movementX, movementY, sliceView } = val;
        const { orientation } = sliceView.navigationState.pose.orientation;
        const axes0 = vec3.fromValues(1, 0, 0);
        const axes1 = vec3.fromValues(0, 1, 0);

        vec3.transformQuat(axes0, axes0, orientation);
        vec3.transformQuat(axes1, axes1, orientation);

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

    this.#onDestroyCb.push(() => {
      translationSubscription.unsubscribe();
      rotationSubscription.unsubscribe();
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
