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
      v-if="incomingVolumeSelected"
      class="card card-body bg-light">

      <!-- flip axis -->
      <div class="mb-3 btn-group">

        <!-- flip x -->
        <div
          @click.stop.prevent="flipAxis(0)"
          :class="flippedState[0] < 0 ? 'btn-secondary' : 'btn-outline-secondary'"
          class="flip-btn btn btn-sm">
          <span>
            flip x axis
          </span>
        </div>

        <!-- flip y -->
        <div
          @click.stop.prevent="flipAxis(1)"
          :class="flippedState[1] < 0 ? 'btn-secondary' : 'btn-outline-secondary'"
          class="flip-btn btn btn-sm">
          <span>
            flip y axis
          </span>
        </div>

        <!-- flip z -->
        <div
          @click.stop.prevent="flipAxis(2)"
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
        
      <!-- scale -->
      <div class="section-wrapper mb-1">
        <div
          class="invisible"
          :class="false?'':'text-muted'">
          <font-awesome-icon
            :icon="lockIconScale"></font-awesome-icon>
        </div>
        <section-component
          id="scale-section"
          title="Scale">
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
          title="Translation"
          id="translation-component">
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
          title="Rotation"
          id="rotation-component">
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
import { mapState, mapActions } from 'vuex'

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

      testValue: 0
    }
  },
  computed: {
    ...mapState({
      appendNehubaFlag: 'appendNehubaFlag',
      flippedState: 'flippedState',
      incVolTranslationLock: 'incVolTranslationLock',
      incVolRotationLock: 'incVolRotationLock',
      lockIconTranslation: state => state.incVolTranslationLock ? 'lock' : 'lock-open',
      lockIconRotation: state => state.incVolRotationLock ? 'lock' : 'lock-open',
      lockIconScale: () => 'lock-open'
    }),
    incVolXformTitle: function () {
      return INC_VOL_XFORM_TITLE
    },
    testScaleX: {
      get: function () {
        return this.testScale[0]
      },
      set: function (value) {
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
        return Array.from(translVec)
      }
    },
    incTransformMatrix: function () {
      return this.$store.state.incTransformMatrix
    },
    dummyIncomingTemplate: function () {
      return {
        id: 'placeholder',
        text: '-- Please select a dataset --',
        value: -1
      }
    },
    incomingVolumeSelected: function () {
      return true || this.$store.state.incomingVolumeSelected
    },
    selectedIncomingVolume: function () {
      const id = this.$store.state.selectedIncomingVolumeId
      return id && this.$store.state.incomingVolumes.find(v => v.id === id)
    },
    selectedIncomingVolumeName: function () {
      return this.selectedIncomingVolume
        ? this.selectedIncomingVolume.name
        : 'No incoming volume selected'
    },
    referenceURLs: function () {
      return this.$store.state.referenceURLs
    },
    renderedIncomingVolumes: function () {
      return [this.dummyIncomingTemplate].concat(this.$store.state.incomingVolumes)
    }
  },
  watch: {
    scale: function () {
      this.scaleChanged()
    },
    scaleX: function () {
      this.scaleChanged()
    },
    scaleY: function () {
      this.scaleChanged()
    },
    scaleZ: function () {
      this.scaleChanged()
    },
    isotropic: function () {
      this.scaleChanged()
    },
    isotropic: function (flag) {
      if (flag) {
        this.isotropicScaleEvent({ value: this.testScaleX })
      }
    }
  },
  methods: {
    ...mapActions({
      lockIncVol: 'lockIncVol',
      rotIncBy: 'rotIncBy',
      pushUndo: 'pushUndo'
    }),
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
      this.$store.dispatch('pushUndo', {
        name: `isotropic scale by slider`,
        collapse: `scaleBySliderIsotropic`
      })

      this.$store.dispatch('setScaleInc', {
        axis: 'x',
        value
      })
      this.$store.dispatch('setScaleInc', {
        axis: 'y',
        value
      })
      this.$store.dispatch('setScaleInc', {
        axis: 'z',
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

      if (delta) {

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

        this.$store.dispatch('pushUndo', {
          name: 'translate by slider delta',
          collapse: 'translateBySliderDelta'
        })

        this.$store.dispatch('translIncBy', {
          axis: 'xyz',
          value: Array.from(pos)
        })
      } else if (value) {
        
        this.$store.dispatch('pushUndo', {
          name: 'translate by slider value',
          collapse: 'translateBySliderValue'
        })

        this.$store.dispatch('setTranslInc', {
          axis,
          value
        })
      }

    },
    rotationEvent: function ({ axis, delta }) {
      this.$store.dispatch('pushUndo', {
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

      this.$store.dispatch('rotIncBy', {
        quaternion: Array.from(q)
      })
    },
    scaleEvent: function ({ axis, value }) {
      this.$store.dispatch('pushUndo', {
        name: `scale ${axis} by slider`,
        collapse: `scaleBySlider${axis}`
      })

      this.$store.dispatch('setScaleInc', {
        axis,
        value
      })
    },
    flipAxis: function (axis) {
      this.$store.dispatch('pushUndo', {
        name: `flip on axis ${axis}`
      })
      this.$store.dispatch('flipAxis', { axis })
    },
    scaleChanged: function () {
      this.$store.dispatch('changeScale', this.isotropic
        ? [this.scale, this.scale, this.scale]
        : [this.scaleX, this.scaleY, this.scaleZ]
      )
    },
    flipLeftRight: function () {
      this.$store.dispatch('flipLeftRight')
    },
    flipInferiorSuperior: function () {
      this.$store.dispatch('flipInferiorSuperior')
    },
    flipAnteriorPosterior: function () {
      this.$store.dispatch('flipAnteriorPosterior')
    }
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
