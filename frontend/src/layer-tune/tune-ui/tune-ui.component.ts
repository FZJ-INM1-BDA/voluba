import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { filter, takeUntil, withLatestFrom } from 'rxjs';
import { Vec3, arrayEqual, isDefined } from 'src/const';
import * as outputs from 'src/state/outputs';
import { getIncXform } from 'src/state/outputs/selectors';
import { DestroyDirective } from 'src/util/destroy.directive';

const RAD_TO_DEG = 180 / Math.PI
const DEG_TO_RAD = Math.PI / 180

type MatState = {
  translateX: number
  translateY: number
  translateZ: number

  scaleX: number
  scaleY: number
  scaleZ: number

  rotX: number
  rotY: number
  rotZ: number
}

type NullablePartial<T> = Partial<{
  [P in keyof T]: T[P] | null 
}>

type FormValidatorParam = {
  min: number
  max: number
}

function getInputValidator(args?: Partial<FormValidatorParam>): ValidatorFn {
  const { min, max } = args || {}
  return (control: AbstractControl): ValidationErrors | null => {
    if (typeof control.value !== "number") {
      return {
        validationError: "Must be number"
      }
    }
    if ( Number.isNaN(control.value) ) {
      return {
        validationError: "Cannot be NaN"
      }
    }
    if (isDefined(min) && control.value < min) {
      return {
        validationError: `Provided value less than ${min}`
      }
    }
    if (isDefined(max) && control.value > max) {
      return {
        validationError: `Provided value greater than ${max}`
      }
    }
    return null
  }
}

@Component({
  selector: 'voluba-tune-ui',
  templateUrl: './tune-ui.component.html',
  styleUrls: ['./tune-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    DestroyDirective
  ]
})
export class TuneUiComponent {

  #destroyed$ = inject(DestroyDirective).destroyed$

  #translationValidator = getInputValidator()
  #scaleValidator = getInputValidator({ min: 0.001 })

  tuneInput = new FormGroup({
    translateX: new FormControl<number>(1, [this.#translationValidator]),
    translateY: new FormControl<number>(2, [this.#translationValidator]),
    translateZ: new FormControl<number>(3, [this.#translationValidator]),

    isotropic: new FormControl<boolean>(true),

    scaleX: new FormControl<number>(1, [this.#scaleValidator]),
    scaleY: new FormControl<number>(1, [this.#scaleValidator]),
    scaleZ: new FormControl<number>(1, [this.#scaleValidator]),
    
    rotX: new FormControl<number>(1, [ getInputValidator({ min: -180, max: 180 })]),
    rotY: new FormControl<number>(1, [ getInputValidator({ min: -90, max: 90 }) ]),
    rotZ: new FormControl<number>(1, [ getInputValidator({ min: -180, max: 180 }) ]),

    // rotation
  }, [
    ctl => {
      if (!(ctl instanceof FormGroup)) {
        return null
      }

      const childErrors: Record<string, any> = {}
      for (const child in ctl.controls){
        if (!!ctl.controls[child].errors) {
          childErrors[child] = ctl.controls[child].errors
        }
      }
      if (Object.keys(childErrors).length === 0) {
        return null
      }
      return childErrors
    }
  ]);

  #currXlate: Vec3 | null = null
  #currScale: Vec3 | null = null
  #currentRot: Vec3 | null = null

  constructor(private store: Store) {

    this.store.pipe(
      getIncXform(),
      withLatestFrom(
        this.store.pipe(
          select(outputs.selectors.flippedState)
        )
      ),
      takeUntil(this.#destroyed$),
    ).subscribe(([xform, flippedState]) => {
      const { mat4, vec3, quat } = export_nehuba;
      const translate = Array.from(mat4.getTranslation(vec3.create(), xform));
      const scale = Array.from(mat4.getScaling(vec3.create(), xform));
      
      /**
       * TODO dealing with euler rotation with flipping is currently too involving
       * bandaid solution: undo the flipping when calculating euler rotation
       * euler rotation is an abstraction from quaternion any way
       */
      const flipMat = mat4.fromScaling(mat4.create(), flippedState)
      const unflippedMat = mat4.mul(mat4.create(), xform, flipMat)
      const rot = mat4.getRotation(quat.create(), unflippedMat)
      quat.normalize(rot, rot)

      this.#currScale = scale as Vec3
      this.#currXlate = translate as Vec3

      const rotX = (() => {

        let v = RAD_TO_DEG * Math.atan2(
          2.0*(rot[1]*rot[2] + rot[0]*rot[3]),
          rot[0]*rot[0] + rot[1]*rot[1] - rot[2]*rot[2] - rot[3]*rot[3]
        )
        while (v < -180) {
          v += 360
        }
        while (v > 180) {
          v -= 360
        }
        return v
      })()
      const rotY = (() => {
        /**
         * dependency on z may become an issue later
         */
        // 0    -> 90   -> 0 -> -90 -> 0
        // -180 -> -90  -> 0 -> 90  -> 180
        // 180          0       180
        let v = RAD_TO_DEG * Math.asin(-2.0*(rot[1]*rot[3] - rot[0]*rot[2]))
        v *= -1
        return v
      })()
      
      const rotZ = (() => {
        let v = RAD_TO_DEG * Math.atan2(
          2.0*(rot[2]*rot[3] + rot[0]*rot[1]),
          rot[0]*rot[0] - rot[1]*rot[1] - rot[2]*rot[2] + rot[3]*rot[3])
        while (v < -180) {
          v += 360
        }
        while (v > 180) {
          v -= 360
        }
        return v
      })()

      this.#currentRot = [rotX, rotY, rotZ] as Vec3

      this.tuneInput.patchValue({
        translateX: translate[0],
        translateY: translate[1],
        translateZ: translate[2],

        scaleX: scale[0],
        scaleY: scale[1],
        scaleZ: scale[2],

        rotX,
        rotY,
        rotZ,
      });
    });

    // TODO figure out a better way to do this than subscribing individual changes
    
    this.tuneInput.valueChanges.pipe(
      takeUntil(this.#destroyed$),
      filter(() => !this.tuneInput.errors),
    ).subscribe(values => {
      this.setTranslScaleRot(values)
    });
  }

  setTranslScaleRot(matState: NullablePartial<MatState>){
    const { translateX, translateY, translateZ, scaleX, scaleY, scaleZ, rotX, rotY, rotZ } = matState
    if (this.#currXlate && isDefined(translateX) && isDefined(translateY) && isDefined(translateZ)) {
      const newXlate: Vec3 = [translateX, translateY, translateZ]
      if (!arrayEqual(newXlate, this.#currXlate)) {
        this.store.dispatch(
          outputs.actions.setIncTranslation({
            array: newXlate
          })
        )
      }
    }
    if (this.#currScale && isDefined(scaleX) && isDefined(scaleY) && isDefined(scaleZ)) {
      const newScale = [scaleX, scaleY, scaleZ]
      if (!arrayEqual(newScale, this.#currScale)) {
        this.store.dispatch(
          outputs.actions.setIncScale({
            array: newScale
          })
        )
      }
    }
    if (this.#currentRot && isDefined(rotX) && isDefined(rotY) && isDefined(rotZ) ) {
      const newRot = [rotX, rotY, rotZ]
      if (!arrayEqual(this.#currentRot, newRot)) {

        const { quat } = export_nehuba
        const diffArray = this.#currentRot.map((v, idx) => (newRot[idx] - v)) as Vec3
        
        console.log(diffArray)
        const rot = quat.fromEuler(quat.create(), ...diffArray)
        quat.normalize(rot, rot)
        this.store.dispatch(
          outputs.actions.rotateIncBy({
            array: Array.from(rot)
          })
        )
      }
    } 

  }

  rotate90(axis: 'x' | 'y' | 'z'){
    const { quat } = export_nehuba
    
    const quaternion = quat.fromEuler(quat.create(), 
      axis === 'x' ? 90 : 0,
      axis === 'y' ? 90 : 0, 
      axis === 'z' ? 90 : 0)

    this.store.dispatch(
      outputs.actions.rotateIncBy({
        array: Array.from(quaternion)
      })
    )
  }
}
