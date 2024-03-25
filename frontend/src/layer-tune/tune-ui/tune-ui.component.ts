import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, concat, distinctUntilChanged, filter, map, of, takeUntil, withLatestFrom } from 'rxjs';
import { Vec3, arrayEqual, isDefined } from 'src/const';
import * as outputs from 'src/state/outputs';
import * as inputs from 'src/state/inputs';
import { DestroyDirective } from 'src/util/destroy.directive';

const RAD_TO_DEG = 180 / Math.PI
const DEG_TO_RAD = Math.PI / 180

type MatState = {
  translateX: number
  translateY: number
  translateZ: number

  isotropic: boolean

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

const cvtToNm = {
  nm: (v: number) => v,
  μm: (v: number) => v * 1e3,
  mm: (v: number) => v * 1e6,
  cm: (v: number) => v * 1e9,
} as const

type VoxelUnit = keyof typeof cvtToNm

const cvtNmTo: Record<VoxelUnit, (nm: number) => number> = {
  nm: v => v,
  μm: v => v / 1e3,
  mm: v => v / 1e6,
  cm: v => v / 1e9,
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

  availableUnits: VoxelUnit[] = ['nm', 'μm', 'mm', 'cm']
  voxelSpacingFormGroup = new FormGroup({
    unit: new FormControl<VoxelUnit>('nm'),
    isotropic: new FormControl<boolean>(false),
    valueX: new FormControl(),
    valueY: new FormControl(),
    valueZ: new FormControl(),
  })

  tuneInput = new FormGroup({
    translateX: new FormControl<number>(1, [this.#translationValidator]),
    translateY: new FormControl<number>(2, [this.#translationValidator]),
    translateZ: new FormControl<number>(3, [this.#translationValidator]),

    isotropic: new FormControl<boolean>(false),

    scaleX: new FormControl<number>(1, [this.#scaleValidator]),
    scaleY: new FormControl<number>(1, [this.#scaleValidator]),
    scaleZ: new FormControl<number>(1, [this.#scaleValidator]),
    
    rotX: new FormControl<number>(1, [ getInputValidator({ min: -180, max: 180 })]),
    rotY: new FormControl<number>(1, [ getInputValidator({ min: -90, max: 90 }) ]),
    rotZ: new FormControl<number>(1, [ getInputValidator({ min: -180, max: 180 }) ]),

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
  ])

  #currVoxelSize: Vec3 | null = null

  #currXlate: Vec3 | null = null
  #currScale: Vec3 | null = null
  #currentRot: Vec3 | null = null

  view$ = combineLatest([
    this.store.pipe(
      outputs.selectors.getFlippedState()
    )
  ]).pipe(
    map(([ flippedState ]) => {

      return {
        xFlipped: flippedState[0] === -1,
        yFlipped: flippedState[1] === -1,
        zFlipped: flippedState[2] === -1,
      }
    })
  )

  constructor(private store: Store) {

    this.store.pipe(
      outputs.selectors.getIncXform(),
      withLatestFrom(
        this.store.pipe(
          outputs.selectors.getFlippedState()
        ),
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

      /**
       * TODO
       * not ideal
       * ideally, remove all reference to this (except patch value at the end)
       */
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
      })

    })

    const incVoxelSize = this.store.pipe(
      inputs.selectors.getIncVoxelSize()
    )
    combineLatest([
      this.store.pipe(
        outputs.selectors.getIncXform()
      ),
      incVoxelSize,
      concat(
        of(this.voxelSpacingFormGroup.controls.unit.value),
        this.voxelSpacingFormGroup.controls.unit.valueChanges,
      ).pipe(
        distinctUntilChanged()
      ),
    ]).pipe(
      takeUntil(this.#destroyed$),
    ).subscribe(([ xform, voxelsize, unit ]) => {
      if (!voxelsize) {
        console.error(`voxelsize cannot be found`)
        return
      }
      if (!unit) {
        console.error(`unit must be defined, but was not`)
        return
      }
      const { vec3, mat4 } = export_nehuba
      const cvtFn = cvtNmTo[unit]

      const scaling = mat4.getScaling(vec3.create(), xform)
      vec3.mul(scaling, scaling, voxelsize)

      this.#currVoxelSize = [
        cvtFn(scaling[0]),
        cvtFn(scaling[1]),
        cvtFn(scaling[2]),
      ]
      this.voxelSpacingFormGroup.patchValue({
        valueX: this.#currVoxelSize[0],
        valueY: this.#currVoxelSize[1],
        valueZ: this.#currVoxelSize[2],
      })
      
    })

    this.tuneInput.valueChanges.pipe(
      takeUntil(this.#destroyed$),
      filter(() => !this.tuneInput.errors),
    ).subscribe(values => {
      const { isotropic } = values
      if (isDefined(isotropic)) {
        if (isotropic) {
          this.tuneInput.controls.scaleY.disable({
            onlySelf: true,
            emitEvent: false
          })
          this.tuneInput.controls.scaleZ.disable({
            onlySelf: true,
            emitEvent: false
          })
        } else {
          this.tuneInput.controls.scaleY.enable({
            onlySelf: true,
            emitEvent: false
          })
          this.tuneInput.controls.scaleZ.enable({
            onlySelf: true,
            emitEvent: false
          })
        }
      }

      this.setTranslScaleRot(values)
      
    })

    const {
      isotropic, unit, valueX, valueY, valueZ
    } = this.voxelSpacingFormGroup.controls
    combineLatest([
      concat(
        of(isotropic.value),
        isotropic.valueChanges
      ),
      valueX.valueChanges,
      valueY.valueChanges,
      valueZ.valueChanges,
    ]).pipe(
      takeUntil(this.#destroyed$),
      withLatestFrom(incVoxelSize),
    ).subscribe(([ [ _isotropic, _valueX, _valueY, _valueZ ], incVoxelSize ]) => {

      if (!incVoxelSize) {
        console.error(`apply changes to voxel size require voxel size, but was not provided!`)
        return
      }
      if (isDefined(_isotropic)) {
        if (_isotropic) {
          valueY.disable({ onlySelf: true, emitEvent: false })
          valueZ.disable({ onlySelf: true, emitEvent: false })
        }
        if (!_isotropic) {
          valueY.enable({ onlySelf: true, emitEvent: false })
          valueZ.enable({ onlySelf: true, emitEvent: false })
        }
      }

      let v: number[]
      if (_isotropic) {
        v = [_valueX, _valueX, _valueX]
      } else {
        v = [_valueX, _valueY, _valueZ]
      }

      if (arrayEqual(v, this.#currVoxelSize || [])) {
        return
      }

      if (!unit.value) {
        console.error(`unit must be defined, but was not`)
        return
      }

      const { vec3 } = export_nehuba
      vec3.div(v, v, incVoxelSize)

      const cvtFn = cvtToNm[unit.value]
      
      const scale = v.map(cvtFn)
      this.setTranslScaleRot({
        scaleX: scale[0],
        scaleY: scale[1],
        scaleZ: scale[2],
      })
    })
  }

  setTranslScaleRot(matState: NullablePartial<MatState>){
    const { translateX, translateY, translateZ, scaleX, scaleY, scaleZ, rotX, rotY, rotZ, isotropic } = matState
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
    if (this.#currScale && !isotropic && isDefined(scaleX) && isDefined(scaleY) && isDefined(scaleZ)) {
      const newScale = [scaleX, scaleY, scaleZ]
      if (!arrayEqual(newScale, this.#currScale)) {
        this.store.dispatch(
          outputs.actions.setIncScale({
            array: newScale
          })
        )
      }
    }

    if (this.#currScale && !!isotropic && isDefined(scaleX)) {
      const newScale = [scaleX, scaleX, scaleX]
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

  flip(axis: 'x' | 'y' | 'z') {
    this.store.dispatch(
      outputs.actions.flipAxis({ axis })
    )
  }
}
