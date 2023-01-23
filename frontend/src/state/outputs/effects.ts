import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from './actions';
import * as consts from './consts';
import * as selectors from './selectors';
import * as inputs from '../inputs';
import { select, Store } from '@ngrx/store';
import { filter, map, withLatestFrom } from 'rxjs';

@Injectable()
export class Effects {
  rotationEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.rotateIncBy),
      withLatestFrom(
        this.store.pipe(select(inputs.selectors.selectedIncoming)),
        this.store.pipe(select(selectors.flippedState)),
        this.store.pipe(select(selectors.incMatrixMat4))
      ),
      filter(([_0, incoming, _1, _2]) => !!incoming),
      map(([input, incoming, flippedState, cXformMat]) => {
        const { mat4, vec3, quat } = export_nehuba;
        const { processQuatInput, getMirrorMat, processVec3Input } = consts;

        const rotQuat = processQuatInput(input);

        const angle = quat.getAxisAngle(vec3.create(), rotQuat);
        const rotMat = mat4.fromRotation(mat4.create(), angle, rotQuat);
        if (!angle) return actions.dry();

        const { size } = incoming!;
        const sizeVec3 = processVec3Input({ array: size });
        const { applyMirror, undoMirror } = getMirrorMat(
          flippedState,
          sizeVec3
        );

        const xformMat = mat4.create();

        /**
         * undo mirror & undo scale
         */
        const cScaling = mat4.getScaling(vec3.create(), cXformMat);
        const ivCScaling = vec3.inverse(vec3.create(), cScaling);
        const cScalingMat = mat4.fromScaling(mat4.create(), ivCScaling);
        mat4.mul(xformMat, undoMirror, cScalingMat);

        /**
         * apply translation correction
         */

        const incTransl = vec3.mul(sizeVec3, sizeVec3, cScaling);
        vec3.scale(incTransl, incTransl, 0.5);
        const incTranslMat = mat4.fromTranslation(mat4.create(), incTransl);
        mat4.mul(xformMat, xformMat, incTranslMat);

        /**
         * save invert
         */
        const invert = mat4.invert(mat4.create(), xformMat);

        /**
         * apply rotation
         */
        try {
          mat4.mul(xformMat, xformMat, rotMat);
        } catch (e) {
          debugger;
        }

        /**
         * apply invert
         */
        mat4.mul(xformMat, xformMat, invert);

        /**
         * multiply original transform to get current transform
         */
        mat4.mul(xformMat, xformMat, cXformMat);

        return actions.setIncMatrix({
          text: Array.from(xformMat).join(','),
        });
      })
    )
  );

  setTranslateEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setIncTranslation),
      withLatestFrom(this.store.pipe(select(selectors.incMatrixMat4))),
      map(([vec3Input, incXM]) => {
        const { mat4, vec3, quat } = export_nehuba;

        const pos = consts.processVec3Input(vec3Input);

        // /**
        //  * account for internal scaling
        //  */
        // const incScale = mat4.getScaling(vec3.create(), incXM)
        // vec3.inverse(incScale, incScale)
        // vec3.mul(pos, pos, incScale)

        // /**
        //  * account for internal rotation of inc volume
        //  */
        // const incRot = mat4.getRotation(quat.create(), incXM)
        // quat.invert(incRot, incRot)
        // vec3.transformQuat(pos, pos, incRot)

        incXM[12] = pos[0];
        incXM[13] = pos[1];
        incXM[14] = pos[2];
        return actions.setIncMatrix({
          text: Array.from(incXM).join(','),
        });
      })
    )
  );

  constructor(private actions$: Actions, private store: Store) {}
}
