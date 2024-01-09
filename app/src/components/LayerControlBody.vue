<template>
  <div class="bg-light">
    <!-- title -->
    <div
      @mousedown="$emit('header-mousedown', $event)"
      class="card title-container pl-3">
      <div class="icon">
        <div
          @click="$emit('close')"
          class="rounded-circle btn btn-sm btn-outline-secondary">
          <font-awesome-icon icon="times"/>
        </div>
      </div>

      <h5 class="title">
        <div>
          {{ incVolXformTitle }}
        </div>
        <small>
          {{ selectedIncomingVolumeName }}
        </small>
      </h5>
    </div>
    
    <div
      v-if="selectedIncomingVolume"
      class="card card-body bg-light">

      <!-- flip axis -->
      <div class="mb-3 btn-group">

        <!-- flip x -->
        <div
          @click.stop.prevent="handleFlipAxis(0)"
          :class="flippedState[0] < 0 ? 'btn-secondary' : 'btn-outline-secondary'"
          class="flip-btn btn btn-sm">
          <span>
            flip x axis
          </span>
        </div>

        <!-- flip y -->
        <div
          @click.stop.prevent="handleFlipAxis(1)"
          :class="flippedState[1] < 0 ? 'btn-secondary' : 'btn-outline-secondary'"
          class="flip-btn btn btn-sm">
          <span>
            flip y axis
          </span>
        </div>

        <!-- flip z -->
        <div
          @click.stop.prevent="handleFlipAxis(2)"
          :class="flippedState[2] < 0 ? 'btn-secondary' : 'btn-outline-secondary'"
          class="flip-btn btn btn-sm">
          <span>
            flip z axis
          </span>
        </div>
      </div>

      <!-- rotate 90 deg -->
      <div class="mb-3 input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">
            Rotate 90 Degrees
          </span>
        </div>
        <div class="input-group-append btn-group">
          <div
            @click="rot('x')"
            class="btn btn-secondary btn-sm">
            x
          </div>
          <div
            @click="rot('y')"
            class="btn btn-secondary btn-sm">
            y
          </div>
          <div
            @click="rot('z')"
            class="btn btn-secondary btn-sm">
            z
          </div>
        </div>
      </div>

      <!-- Resolution -->
      <div class="section-wrapper mb-1">
        <div
          @click="lockIncVol({ incVolTranslationLock: !incVolTranslationLock})">
          <font-awesome-icon :icon="lockIconTranslation"></font-awesome-icon>
        </div>
        <section-component
          :forceHide="incVolTranslationLock"
          id="translation-component">
          <template slot="header">
            <strong :class="incVolTranslationLock ? 'text-muted' : ''">
              Resolution
            </strong>
          </template>
          <template slot="body">

            <b-form-radio-group
              id="btn-radios-1"
              v-model="selectedUnit"
              :options="units"
              :aria-describedby="'ariaDescribedby'"
              name="radios-btn-default"
              buttons></b-form-radio-group>
            <div>
              <label class="mr-2">X-axis</label>
              <div class="input-group">
                <input v-model="selectedResolutionX" @input="setResolution" type="number" class="form-control rounded-0">
                <div class = "input-group-append">
                  <span class = "input-group-text rounded-0">{{selectedUnit}}</span>
                </div>
              </div>
            </div>
            <div>
              <label class="mr-2 mt-2">Y-axis</label>
              <div class="input-group">
                <input v-model="selectedResolutionY" @input="setResolution" type="number" class="form-control rounded-0">
                <div class = "input-group-append">
                  <span class = "input-group-text rounded-0">{{selectedUnit}}</span>
                </div>
              </div>
            </div>
            <div>
              <label class="mr-2 mt-2">Z-axis</label>
              <div class="input-group">
                <input v-model="selectedResolutionZ" @input="setResolution" type="number" class="form-control rounded-0">
                <div class = "input-group-append">
                  <span class = "input-group-text rounded-0">{{selectedUnit}}</span>
                </div>
              </div>
            </div>

            <b-button size="sm" class="mt-3" @click="resetResolution">
              Reset
            </b-button>
          </template>

        </section-component>
      </div>
        
      <!-- scale -->
      <div class="section-wrapper mb-1">
        <div
          @click="lockIncVol({ incVolScaleLock: !incVolScaleLock})">
          <font-awesome-icon :icon="lockIconScale" />
        </div>
        <section-component
          :forceHide="incVolScaleLock"
          id="scale-section">
          <template slot="header">
            <strong :class="incVolScaleLock ? 'text-muted' : ''">
              Scale
            </strong>
          </template>
          <template slot="body">
            <input
              v-model="isotropic"
              type="checkbox"
              id="isotropicScale"
              name="isotropicScale">
            <label for="isotropicScale">Isotropic</label>
            <SliderComponent
              v-if="isotropic"
              @minus="isotropicScaleEvent({value: testScaleX - 0.05 < scaleMin ? scaleMin : testScaleX - 0.05 })"
              @plus="isotropicScaleEvent({value: testScaleX + 0.05 > scaleMax ? scaleMax : testScaleX + 0.05 })"
              @textInput="isotropicScaleEvent({value: $event })"
              @sliderInput="isotropicScaleEvent({value: $event })"
              name="Scale"
              :min="0.1"
              :max="10"
              :step="0.01"
              :value="testScaleX" />
            <SliderComponent
              v-if="!isotropic"
              @minus="testScaleX = testScaleX - 0.05 < scaleMin ? scaleMin : testScaleX - 0.05"
              @plus="testScaleX = testScaleX + 0.05 > scaleMax ? scaleMax : testScaleX + 0.05"
              @textInput="testScaleX = $event"
              @sliderInput="testScaleX = $event"
              name="Scale X"
              :min="0.1"
              :max="10"
              :step="0.01"
              :value="testScaleX" />
            <SliderComponent
              v-if="!isotropic"
              @minus="testScaleY = testScaleY - 0.05 < scaleMin ? scaleMin : testScaleY - 0.05"
              @plus="testScaleY = testScaleY + 0.05 > scaleMax ? scaleMax : testScaleY + 0.05"
              @textInput="testScaleY = $event"
              @sliderInput="testScaleY = $event"
              name="Scale Y"
              :min="0.1"
              :max="10"
              :step="0.01"
              :value="testScaleY" />
            <SliderComponent
              v-if="!isotropic"
              @minus="testScaleZ = testScaleZ - 0.05 < scaleMin ? scaleMin : testScaleZ - 0.05"
              @plus="testScaleZ = testScaleZ + 0.05 > scaleMax ? scaleMax : testScaleZ + 0.05"
              @textInput="testScaleZ = $event"
              @sliderInput="testScaleZ = $event"
              name="Scale Z"
              :min="0.1"
              :max="10"
              :step="0.01"
              :value="testScaleZ" />
          </template>
        </section-component>
      </div>


      <!-- translation -->
      <div class="section-wrapper mb-1">
        <div
          @click="lockIncVol({ incVolTranslationLock: !incVolTranslationLock})">
          <font-awesome-icon :icon="lockIconTranslation"></font-awesome-icon>
        </div>
        <section-component
          :forceHide="incVolTranslationLock"
          id="translation-component">
          <template slot="header">
            <strong :class="incVolTranslationLock ? 'text-muted' : ''">
              Translation
            </strong>
          </template>
          <template slot="body">
            <SliderComponent
              @minus="translationEvent({ axis: 'x', event:$event, delta: testTranslX - 0.1 < translMin ? 0 :  - 0.1 })"
              @plus="translationEvent({ axis: 'x', event:$event, delta: testTranslX + 0.1 > translMax ? 0 : 0.1 })"
              @textInput="translationEvent({axis: 'x', event:$event, value: $event})"
              @sliderInput="translationEvent({axis: 'x', event:$event, value: $event})"
              name="X-axis"
              :min="translMin"
              :max="translMax"
              :step="0.1"
              unit="mm"
              :value="testTranslX" />
            <SliderComponent
              @minus="translationEvent({axis: 'y', event:$event, delta: testTranslY - 0.1 < translMin ? 0 : - 0.1 }) "
              @plus="translationEvent({axis: 'y', event:$event, delta: testTranslY + 0.1 > translMax ? 0 : 0.1 }) "
              @textInput="translationEvent({axis: 'y', event:$event, value: $event})"
              @sliderInput="translationEvent({axis: 'y', event:$event, value: $event})"
              name="Y-axis"
              :min="translMin"
              :max="translMax"
              :step="0.1"
              unit="mm"
              :value="testTranslY" />
            <SliderComponent
              @minus="translationEvent({axis: 'z', event:$event, delta: testTranslZ - 0.1 < translMin ? 0 : - 0.1})"
              @plus="translationEvent({axis: 'z', event:$event, delta: testTranslZ + 0.1 > translMax ? 0 : 0.1})"
              @textInput="translationEvent({axis: 'z', event:$event, value: $event})"
              @sliderInput="translationEvent({axis: 'z', event:$event, value: $event})"
              name="Z-axis"
              :min="translMin"
              :max="translMax"
              :step="0.1"
              unit="mm"
              :value="testTranslZ" />
          </template>
        </section-component>
      </div>

      <!-- rotation -->
      <div class="section-wrapper mb-1">
        <div
          @click="lockIncVol({ incVolRotationLock: !incVolRotationLock})">
          <font-awesome-icon :icon="lockIconRotation" />
        </div>
        <section-component
          :forceHide="incVolRotationLock"
          id="rotation-component">
          <template slot="header">
            <strong :class="incVolRotationLock ? 'text-muted' : ''">
              Rotation
            </strong>
          </template>
          <template slot="body">
            <SliderComponent
              @minus="rotationEvent({axis : 'x', delta: testRotateX - 0.1 < rotateMin ? 0 : - 0.1})"
              @plus="rotationEvent({axis: 'x', delta: testRotateX + 0.1 > rotateMax ? 0 : 0.1})"
              @textInput="rotationEvent({ axis: 'x', delta: $event - testRotateX })"
              @sliderInput="rotationEvent({ axis: 'x', delta: $event - testRotateX })"
              name="X-axis"
              :min="rotateMin"
              :max="rotateMax"
              :step="0.1"
              unit="deg"
              :value="testRotateX" />
            <SliderComponent
              @minus="rotationEvent({axis : 'y', delta: testRotateY - 0.1 < -90 ? 0 : - 0.1})"
              @plus="rotationEvent({axis: 'y', delta: testRotateY + 0.1 > 90 ? 0 : 0.1})"
              @textInput="rotationEvent({ axis: 'y', delta: $event - testRotateY })"
              @sliderInput="rotationEvent({ axis: 'y', delta: $event - testRotateY })"
              name="Y-axis"
              :min="-90"
              :max="90"
              :step="0.1"
              unit="deg"
              :value="testRotateY" />
            <SliderComponent
              @minus="rotationEvent({axis : 'z', delta: testRotateZ - 0.1 < rotateMin ? 0 : - 0.1})"
              @plus="rotationEvent({axis: 'z', delta: testRotateZ + 0.1 > rotateMax ? 0 : 0.1})"
              @textInput="rotationEvent({ axis: 'z', delta: $event - testRotateZ })"
              @sliderInput="rotationEvent({ axis: 'z', delta: $event - testRotateZ })"
              name="Z-axis"
              :min="rotateMin"
              :max="rotateMax"
              :step="0.1"
              unit="deg"
              :value="testRotateZ" />

            <div class="mb-1"></div>

          </template>
        </section-component>
      </div>

    </div>
  </div>
</template>
<script>
import SectionComponent from '@/components/layout/Section'
import SliderComponent from '@/components/layout/Slider'
import { mapState, mapActions, mapGetters } from 'vuex'
import { convertVoxelToNm, convertNmToVoxel } from "@/constants"

import { INC_VOL_XFORM_TITLE } from '@/text'

export default {
  components: {
    SectionComponent,
    SliderComponent
  },
  data: function () {
    return {

      radToDegFactor: 180 / Math.PI,
      rotateMin: -180,
      rotateMax: 180,

      translMin: -100,
      translMax: 100,

      isotropic: true,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      scale: 1,
      scaleMin: 0.1,
      scaleMax: 10,
      scaleStep: 0.01,

      testValue: 0,

      selectedResolutionX: 0,
      selectedResolutionY: 0,
      selectedResolutionZ: 0,

      units: ['nm', 'μm', 'mm', 'cm'],
      selectedUnit: 'nm'
    }
  },
  computed: {
    ...mapState('nehubaStore', [
      'appendNehubaFlag',
      'flippedState',
      'incTransformMatrix',

      'incVolTranslationLock',
      'incVolRotationLock',
      'incVolScaleLock',
    ]),
    ...mapGetters('dataSelectionStore', [
      'selectedIncomingVolume'
    ]),
    ...mapState('dataSelectionStore', [
      'incomingVolumes',
      'selectedIncomingVolumeResolution',
      'coordinateSpace',
    ]),
    ...mapState('nehubaStore', {
      lockIconTranslation: state => state.incVolTranslationLock ? 'lock' : 'lock-open',
      lockIconRotation: state => state.incVolRotationLock ? 'lock' : 'lock-open',
      lockIconScale: state => state.incVolScaleLock ? 'lock' : 'lock-open'
    }),
    incVolXformTitle: function () {
      return INC_VOL_XFORM_TITLE
    },
    testScaleX: {
      get: function () {
        return this.testScale[0]
      },
      set: function (value) {
        this.selectedResolutionX = this.fixed(+this.testScaleX * this.selectedIncomingVolumeResolutionX)
        this.scaleEvent({
          axis: 'x',
          value
        })
      }
    },
    testScaleY: {
      get: function () {
        return this.testScale[1]
      },
      set: function (value) {
        this.selectedResolutionY = this.fixed(+this.testScaleY * this.selectedIncomingVolumeResolutionY)
        this.scaleEvent({
          axis: 'y',
          value
        })
      }
    },
    testScaleZ: {
      get: function () {
        return this.testScale[2]
      },
      set: function (value) {
        this.selectedResolutionZ = this.fixed(+this.testScaleZ * this.selectedIncomingVolumeResolutionZ)
        this.scaleEvent({
          axis: 'z',
          value
        })
      }
    },
    testScale: {
      get: function () {
        const { mat4, vec3 } = window.export_nehuba
        const xformMat = mat4.fromValues(...this.incTransformMatrix)
        const scaleVec = mat4.getScaling(vec3.create(), xformMat)
        return Array.from(scaleVec)
      }
    },
    testRotateValue: function (){
      return this.radToDegFactor * Math.asin(-2.0*(this.testRot[1]*this.testRot[3] - this.testRot[0]*this.testRot[2]))
    },
    testRotateX: {
      get: function () {
        // -0 -> -180 180 -> 0
        let v = this.radToDegFactor * Math.atan2(
          2.0*(this.testRot[1]*this.testRot[2] + this.testRot[0]*this.testRot[3]),
          this.testRot[0]*this.testRot[0] + this.testRot[1]*this.testRot[1] - this.testRot[2]*this.testRot[2] - this.testRot[3]*this.testRot[3]
          )
        v += 180
        v *= -1
        while (v < this.rotateMin) {
          v += 360
        }
        while (v > this.rotateMax) {
          v -= 360
        }
        // let v = this.radToDegFactor * Math.atan2(2.0*(this.testRot[2]*this.testRot[3] + this.testRot[0]*this.testRot[1]), this.testRot[0]*this.testRot[0] - this.testRot[1]*this.testRot[1] - this.testRot[2]*this.testRot[2] + this.testRot[3]*this.testRot[3])
        return v
      }
    },
    testRotateY: {
      get: function () {
        
        /**
         * dependency on z may become an issue later
         */
        // 0    -> 90   -> 0 -> -90 -> 0
        // -180 -> -90  -> 0 -> 90  -> 180
        // 180          0       180
        let v = this.radToDegFactor * Math.asin(-2.0*(this.testRot[1]*this.testRot[3] - this.testRot[0]*this.testRot[2]))
        v *= -1
        return v
      }
    },
    testRotateZ: {
      get: function () {
        let v = this.radToDegFactor * Math.atan2(
          2.0*(this.testRot[2]*this.testRot[3] + this.testRot[0]*this.testRot[1]),
          this.testRot[0]*this.testRot[0] - this.testRot[1]*this.testRot[1] - this.testRot[2]*this.testRot[2] + this.testRot[3]*this.testRot[3])
        while (v < this.rotateMin) {
          v += 360
        }
        while (v > this.rotateMax) {
          v -= 360
        }
        return v
      }
    },
    testRot: {
      get: function () {
        const {quat, mat4, vec3} = window.export_nehuba
        const xformMat = mat4.fromValues(...this.incTransformMatrix)
        /**
         * TODO dealing with euler rotation with flipping is currently too involving
         * bandaid solution: undo the flipping when calculating euler rotation
         * euler rotation is an abstraction from quaternion any way
         */
        const flipVec = vec3.fromValues(...this.flippedState)
        const flipMat = mat4.fromScaling(mat4.create(), flipVec)
        mat4.mul(xformMat, xformMat, flipMat)
        const rotQuat = mat4.getRotation(quat.create(), xformMat)
        quat.normalize(rotQuat, rotQuat)
        return Array.from(rotQuat)
      }
    },
    testTranslX: {
      get: function () {
        return this.testTransl[0] / 1e6 * this.flippedState[0]
      }
    },
    testTranslY: {
      get: function () {
        return this.testTransl[1] / 1e6 * this.flippedState[1]
      }
    },
    testTranslZ: {
      get: function () {
        return this.testTransl[2] / 1e6 * this.flippedState[2]
      }
    },
    testTransl: {
      get: function () {
        const {vec3, mat4} = window.export_nehuba
        const xformMat = mat4.fromValues(...this.incTransformMatrix)
        const translVec = mat4.getTranslation(vec3.create(), xformMat)
        return convertVoxelToNm(this.coordinateSpace, translVec, "vec3")
      }
    },
    selectedIncomingVolumeName: function () {
      return this.selectedIncomingVolume
        ? this.selectedIncomingVolume.name
        : 'No incoming volume selected'
    },
    referenceURLs: function () {
      return this.$store.state.referenceURLs
    },
    selectedIncomingVolumeResolutionX: {
      get: function () {
        return this.nmToSelectedUnit(this.selectedIncomingVolumeResolution[0])
      }
    },
    selectedIncomingVolumeResolutionY: {
      get: function () {
        return this.nmToSelectedUnit(this.selectedIncomingVolumeResolution[1])
      }
    },
    selectedIncomingVolumeResolutionZ: {
      get: function () {
        return this.nmToSelectedUnit(this.selectedIncomingVolumeResolution[2])
      }
    },
  },
  watch: {
    isotropic: function (flag) {
      if (flag) {
        this.isotropicScaleEvent({ value: this.testScaleX })
      }
    },
    selectedIncomingVolumeResolution: function (flag) {
      this.resetResolution()
    },
    selectedUnit: function(newUnit, prevUnit) {
      this.selectedResolutionX = this.changeUnit(this.selectedResolutionX, prevUnit)
      this.selectedResolutionY = this.changeUnit(this.selectedResolutionY, prevUnit)
      this.selectedResolutionZ = this.changeUnit(this.selectedResolutionZ, prevUnit)
    }
  },
  methods: {
    ...mapActions('nehubaStore', [
      'translIncBy',
      'setTranslInc',
      'lockIncVol',
      'rotIncBy',
      'setScaleInc',
      'flipAxis'
    ]),
    ...mapActions([
      'pushUndo'
    ]),
    rot(axis){
      if (!this.appendNehubaFlag)
        return
      const {quat} = window.export_nehuba
      const quaternion = quat.fromEuler(quat.create(), 
        axis === 'x' ? 90 : 0,
        axis === 'y' ? 90 : 0, 
        axis === 'z' ? 90 : 0)
      this.pushUndo({
        name: `rotate incoming volume along ${axis} axis by 90deg`
      })
      this.rotIncBy({ quaternion })
    },
    isotropicScaleEvent: function ({value}) {
      this.pushUndo({
        name: `isotropic scale by slider`,
        collapse: `scaleBySliderIsotropic`
      })


      this.selectedResolutionX = this.fixed(+this.testScaleX * this.selectedIncomingVolumeResolutionX)
      this.selectedResolutionY = this.fixed(+this.testScaleY * this.selectedIncomingVolumeResolutionY)
      this.selectedResolutionZ = this.fixed(+this.testScaleZ * this.selectedIncomingVolumeResolutionZ)

      this.setIsotropicScale(value)
    },
    setIsotropicScale: function(value) {
      this.setScaleInc({
        axis: 'xyz',
        value
      })
    },
    translationEvent: function ({axis, delta, value}) {
      const {mat4, quat, vec3} = window.export_nehuba
      const pos = vec3.create()
      const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : axis === 'z' ? 2 : null

      if (idx === null) {
        return
      }

      pos[idx] = delta || value


      const incXM = mat4.fromValues(...this.incTransformMatrix)

      /**
       * account for internal scaling
       */
      const incScale = mat4.getScaling(vec3.create(), incXM)
      vec3.inverse(incScale, incScale)
      vec3.mul(pos, pos, incScale)

      /**
       * account for internal rotation of inc volume
       */
      const incRot = mat4.getRotation(quat.create(), incXM)
      quat.invert(incRot, incRot)
      vec3.transformQuat(pos, pos, incRot)

      if (delta) {

        this.pushUndo({
          name: 'translate by slider delta',
          collapse: 'translateBySliderDelta'
        })

        this.translIncBy({
          axis: 'xyz',
          value: convertNmToVoxel(this.coordinateSpace, pos, "vec3")
        })
      }
      
      if (value) {

        this.pushUndo({
          name: 'translate by slider value',
          collapse: 'translateBySliderValue'
        })

        this.setTranslInc({
          axis,
          value: convertNmToVoxel(this.coordinateSpace, value * 1e6, axis)
        })
      }

    },
    rotationEvent: function ({ axis, delta }) {
      this.pushUndo({
        name: `rotate ${axis} by slider`,
        collapse: `rotateBySlider${axis}`
      })

      const {quat} = window.export_nehuba
      const q = quat.fromEuler(
        quat.create(),
        axis === 'x' ? delta : 0,
        axis === 'y' ? delta : 0,
        axis === 'z' ? delta : 0
      )

      this.rotIncBy({
        quaternion: Array.from(q)
      })
    },
    scaleEvent: function ({ axis, value }) {
      this.pushUndo({
        name: `scale ${axis} by slider`,
        collapse: `scaleBySlider${axis}`
      })

      this.setScaleInc({
        axis,
        value
      })
    },
    handleFlipAxis: function (axis) {
      this.pushUndo({
        name: `flip on axis ${axis}`
      })
      this.flipAxis({ axis })
    },
    setResolution: function () {
      
      const isotropic = +this.selectedResolutionX === +this.selectedResolutionY && +this.selectedResolutionY === +this.selectedResolutionZ

      if (isotropic) {
        this.setIsotropicScale(+this.selectedResolutionX/this.selectedIncomingVolumeResolutionX)
      } else {
          this.isotropic = false
          const scaleX = this.selectedResolutionX/this.selectedIncomingVolumeResolutionX
          const scaleY = this.selectedResolutionY/this.selectedIncomingVolumeResolutionY
          const scaleZ = this.selectedResolutionZ/this.selectedIncomingVolumeResolutionZ

          this.scaleEvent({axis: 'x', value: scaleX})
          this.scaleEvent({axis: 'y', value: scaleY})
          this.scaleEvent({axis: 'z', value: scaleZ})
      }
    },

    nmToSelectedUnit: function (num) {
      const div = this.selectedUnit === 'μm'? 1000 
        : this.selectedUnit === 'mm'? 1e6
          : this.selectedUnit === 'cm'? 1e7 : 1
      return +num / div
    },

    changeUnit: function (num, prevUnit) {
      const mult = prevUnit === 'μm'? 1000 
        : prevUnit === 'mm'? 1e6
          : prevUnit === 'cm'? 1e7 : 1
      const nm = +num * mult
      return this.fixed(this.nmToSelectedUnit(nm))
    },
    fixed: function (num) {
      const decimal = this.selectedUnit === 'μm'? 2
        : this.selectedUnit === 'mm'? 3
          : this.selectedUnit === 'cm'? 4 : 0
      return parseFloat(num.toFixed(decimal))
    },
    resetResolution: function () {
      this.testScaleX = 1
      this.testScaleY = 1
      this.testScaleZ = 1
      this.isotropic = true 

      this.selectedUnit = 'nm'
      this.selectedResolutionX = this.selectedIncomingVolumeResolutionX
      this.selectedResolutionY = this.selectedIncomingVolumeResolutionY
      this.selectedResolutionZ = this.selectedIncomingVolumeResolutionZ
    },
  }
}
</script>
<style scoped>
.option-container
{
  display: flex;
}

.option-label
{
  flex: 0 0 30%;
}
.option-input
{
  flex: 1 1 0px;
}
.option-value
{
  flex: 0 0 10%;
}
.flip-btn:not(.disabled):hover
{
  cursor: default;
}
.title
{
  padding-left: 0.5em;
  padding-right: 1.5em;
  padding-top: 0.5em;
  padding-bottom:0.5em;
  margin-bottom:0;

  transition: linear 150ms all;
}
.section-wrapper
{
  display: flex;
}

.section-wrapper > *:first-child
{
  flex: 0 0 1em;
  width: 1em;
}

.section-wrapper > *:last-child
{
  flex: 1 0 auto;
}
.title-container
{
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-container:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
}
</style>
