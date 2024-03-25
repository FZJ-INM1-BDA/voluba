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
        this.store.pipe(select(selectors.incMatrixMat4)),
        this.store.pipe(
          select(inputs.selectors.centerVoxel)
        )
      ),
      filter(([_0, incoming, _1, _2]) => !!incoming),
      map(([input, incoming, cXformMat, centerVoxel]) => {
        const { mat4, vec3, quat } = export_nehuba;
        const { processQuatInput } = consts;

        const rotQuat = processQuatInput(input);

        const angle = quat.getAxisAngle(vec3.create(), rotQuat);
        const rotMat = mat4.fromRotation(mat4.create(), angle, rotQuat);
        if (!angle) return actions.dry();
        if (!centerVoxel) return actions.dry()
        
        const xformMat = mat4.create();
        
        const centralizeMatrix = mat4.fromTranslation(mat4.create(), centerVoxel.map(v => v * -1))
        const decentralizeMatrix = mat4.fromTranslation(mat4.create(), centerVoxel)

        mat4.mul(xformMat, centralizeMatrix, xformMat)

        mat4.mul(
          xformMat,
          rotMat,
          xformMat)
        
        mat4.mul(xformMat, decentralizeMatrix, xformMat)
        
        mat4.mul(xformMat, cXformMat, xformMat)

        return actions.setIncMatrix({
          text: Array.from(xformMat).join(','),
        });
      })
    )
  );

  setScaleEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.setIncScale),
    withLatestFrom(
      this.store.pipe(
        selectors.getIncXform(),
      ),
      this.store.pipe(
        select(inputs.selectors.centerVoxel),
      )
    ),
    map(([vec3Input, cXform, centerVoxel]) => {
      
      const { mat4, vec3 } = export_nehuba;
      
      const oldScale = mat4.getScaling(vec3.create(), cXform)
      const newScale = consts.processVec3Input(vec3Input)
      vec3.div(newScale, newScale, oldScale)
      
      const scaleMat = mat4.fromScaling(mat4.create(), newScale)

      const xformMat = mat4.create()

      const centralizeMatrix = mat4.fromTranslation(mat4.create(), vec3.scale(vec3.create(), centerVoxel!, -1) )
      const decentralizeMatrix = mat4.fromTranslation(mat4.create(), centerVoxel!)
      mat4.mul(xformMat, centralizeMatrix, xformMat)
      mat4.mul(xformMat, scaleMat, xformMat)
      mat4.mul(xformMat, decentralizeMatrix, xformMat)

      mat4.mul(xformMat, cXform, xformMat)
      
      return actions.setIncMatrix({
        text: Array.from(xformMat).join(",")
      })
    })
  ))

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
  )

  onAxisFlip = createEffect(() => this.actions$.pipe(
    ofType(actions.flipAxis),
    withLatestFrom(
      this.store.pipe(
        selectors.getIncXform()
      )
    ),
    map(([ flipAxisAction, xform ]) => {
      const { vec3, mat4 } = export_nehuba

      const { axis } = flipAxisAction
      const flipVec3 = vec3.fromValues(1, 1, 1)
      
      if (axis === 'x') flipVec3[0] = -1
      if (axis === 'y') flipVec3[1] = -1
      if (axis === 'z') flipVec3[2] = -1

      const currScaling = mat4.getScaling(vec3.create(), xform)
      vec3.mul(currScaling, currScaling, flipVec3)
      return actions.setIncScale({
        array: Array.from(currScaling)
      })
    })
  ))


  constructor(private actions$: Actions, private store: Store) {}
}
