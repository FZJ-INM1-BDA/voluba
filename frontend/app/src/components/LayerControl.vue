<template>
    <div>
      <!-- title -->
      <div
        @mousedown="$emit('header-mousedown', $event)"
        class="card bg-light">

        <h5 class="title">
          {{ selectedIncomingVolumeName }}
        </h5>
      </div>
      
      <div
        v-if = "incomingVolumeSelected"
        class="card card-body bg-light">

        <!-- color -->
        <div class="option-container">
          <label class="option-label">Color:</label>
          <div class="option-input">
            <div @click.stop = "showOverlayColor = !showOverlayColor" :style="{'background-color': overlayColor.hex, 'min-width': '20px', 'max-width': '20px', 'min-height': '20px', 'border': '1px solid black'}" v-b-tooltip.hover :title="overlayColor.hex"></div>
            <compact-picker v-if = "showOverlayColor" v-model="overlayColor" />
          </div>
        </div>

        <!-- opacity -->
        <div class="option-container" style="margin-top: 5px;">
          <label for="opacitySlider" class="option-label">Opacity:</label>
          <div class = "option-input">
            <input
              name = "opacitySlider"
              id = "opacitySlider"
              class = "slider"
              type = "range"
              :min = "opacityMin"
              :max = "opacityMax"
              :step = "opacityStep"
              v-model = "opacity"/>
          </div>
          <div class="option-value">
            {{ Number(opacity).toFixed(2) }}
          </div>
        </div>

        <!-- scale -->
        <section-component
          class = "mb-2"
          id="scale-section"
          title="Scale"
          style="margin-top: 5px;">
          <template slot = "body">
            <SliderComponent
              @minus = "testScaleX = testScaleX - 0.05 < scaleMin ? scaleMin : testScaleX - 0.05"
              @plus = "testScaleX = testScaleX + 0.05 > scaleMax ? scaleMax : testScaleX + 0.05"
              @textInput = "testScaleX = $event"
              @sliderInput = "testScaleX = $event"
              name = "Scale X"
              :min = "0.1"
              :max = "10"
              :step = "0.01"
              :value = "testScaleX" />
            <SliderComponent
              @minus = "testScaleY = testScaleY - 0.05 < scaleMin ? scaleMin : testScaleY - 0.05"
              @plus = "testScaleY = testScaleY + 0.05 > scaleMax ? scaleMax : testScaleY + 0.05"
              @textInput = "testScaleY = $event"
              @sliderInput = "testScaleY = $event"
              name = "Scale Y"
              :min = "0.1"
              :max = "10"
              :step = "0.01"
              :value = "testScaleY" />
            <SliderComponent
              @minus = "testScaleZ = testScaleZ - 0.05 < scaleMin ? scaleMin : testScaleZ - 0.05"
              @plus = "testScaleZ = testScaleZ + 0.05 > scaleMax ? scaleMax : testScaleZ + 0.05"
              @textInput = "testScaleZ = $event"
              @sliderInput = "testScaleZ = $event"
              name = "Scale Z"
              :min = "0.1"
              :max = "10"
              :step = "0.01"
              :value = "testScaleZ" />
          </template>
        </section-component>

        <!-- translation -->
        <section-component
          class="mb-2"
          title="Translation"
          id="translation-component">
          <template slot = "body">
            <SliderComponent
              @minus = "testTranslX = testTranslX - 0.1 < translMin ? translMin : testTranslX - 0.1"
              @plus = "testTranslX = testTranslX + 0.1 > translMax ? translMax : testTranslX + 0.1"
              @textInput = "testTranslX = $event"
              @sliderInput = "testTranslX = $event"
              name = "X-axis"
              :min = "translMin"
              :max = "translMax"
              :step = "0.1"
              unit = "mm"
              :value = "testTranslX" />
            <SliderComponent
              @minus = "testTranslY = testTranslY - 0.1 < translMin ? translMin : testTranslY - 0.1"
              @plus = "testTranslY = testTranslY + 0.1 > translMax ? translMax : testTranslY + 0.1"
              @textInput = "testTranslY = $event"
              @sliderInput = "testTranslY = $event"
              name = "Y-axis"
              :min = "translMin"
              :max = "translMax"
              :step = "0.1"
              unit = "mm"
              :value = "testTranslY" />
            <SliderComponent
              @minus = "testTranslZ = testTranslZ - 0.1 < translMin ? translMin : testTranslZ - 0.1"
              @plus = "testTranslZ = testTranslZ + 0.1 > translMax ? translMax : testTranslZ + 0.1"
              @textInput = "testTranslZ = $event"
              @sliderInput = "testTranslZ = $event"
              name = "Z-axis"
              :min = "translMin"
              :max = "translMax"
              :step = "0.1"
              unit = "mm"
              :value = "testTranslZ" />
          </template>
        </section-component>

        <!-- rotation -->
        <section-component
          class = "mb-2"
          title = "Rotation"
          id = "rotation-component">
          <template slot = "body">
            <SliderComponent
              @minus = "testRotateX = testRotateX - 0.1 < rotateMin ? rotateMin : testRotateX - 0.1"
              @plus = "testRotateX = testRotateX + 0.1 > rotateMax ? rotateMax : testRotateX + 0.1"
              @textInput = "testRotateX = $event"
              @sliderInput = "testRotateX = $event"
              name = "X-axis"
              :min = "rotateMin"
              :max = "rotateMax"
              :step = "0.1"
              unit = "deg"
              :value = "testRotateX" />
            <SliderComponent
              @minus = "testRotateY = testRotateY - 0.1 < rotateMin ? rotateMin : testRotateY - 0.1"
              @plus = "testRotateY = testRotateY + 0.1 > rotateMax ? rotateMax : testRotateY + 0.1"
              @textInput = "testRotateY = $event"
              @sliderInput = "testRotateY = $event"
              name = "Y-axis"
              :min = "rotateMin"
              :max = "rotateMax"
              :step = "0.1"
              unit = "deg"
              :value = "testRotateY" />
            <SliderComponent
              @minus = "testRotateZ = testRotateZ - 0.1 < rotateMin ? rotateMin : testRotateZ - 0.1"
              @plus = "testRotateZ = testRotateZ + 0.1 > rotateMax ? rotateMax : testRotateZ + 0.1"
              @textInput = "testRotateZ = $event"
              @sliderInput = "testRotateZ = $event"
              name = "Z-axis"
              :min = "rotateMin"
              :max = "rotateMax"
              :step = "0.1"
              unit = "deg"
              :value = "testRotateZ" />

            <div class="mb-1"></div>

            <!-- rotation options -->
            <div class="btn-group">

              <!-- flip x -->
              <div
                @click.stop.prevent="flipAxis(0)"
                class="flip-btn btn btn-sm btn-outline-secondary">
                <span>
                  flip x axis
                </span>
              </div>

              <!-- flip y -->
              <div
                @click.stop.prevent="flipAxis(1)"
                class="flip-btn btn btn-sm btn-outline-secondary">
                <span>
                  flip y axis
                </span>
              </div>

              <!-- flip z -->
              <div
                @click.stop.prevent="flipAxis(2)"
                class="flip-btn btn btn-sm btn-outline-secondary">
                <span>
                  flip z axis
                </span>
              </div>
            </div>
          </template>
        </section-component>

      </div>
    </div>
</template>
<script>
// Vue-Color
import { Compact } from 'vue-color'
import CardComponent from '@/components/Card'
import SectionComponent from '@/components/Section'
import SliderComponent from '@/components/Slider'

export default {
  components: {
    CardComponent,
    SectionComponent,
    'compact-picker': Compact,
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
      opacity: 0.5,
      opacityMin: 0,
      opacityMax: 1.0,
      opacityStep: 0.01,

      overlayColor: this.$store.state.overlayColor,
      showOverlayColor: false,

      testValue: 0
    }
  },
  computed: {
    testScaleX: {
      get: function () {
        return this.testScale[0]
      },
      set: function (value) {
        console.log(value)
        this.$store.dispatch('setScaleInc', {
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
        this.$store.dispatch('setScaleInc', {
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
        this.$store.dispatch('setScaleInc', {
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
        // let v = this.radToDegFactor * Math.asin(-2.0*(this.testRot[1]*this.testRot[3] - this.testRot[0]*this.testRot[2]))
        // while (v < this.rotateMin) {
        //   v += 360
        // }
        // while (v > this.rotateMax) {
        //   v -= 360
        // }

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
      },
      set: function (value) {
        this.$store.dispatch('setRotateInc', {
          axis: 'xyz',
          value: [value, this.testRotateY, this.testRotateZ]
        })
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
      },
      set: function (value) {
        if (value > 90 || value < -90) {
          return
        }
        this.$store.dispatch('setRotateInc', {
          axis: 'xyz',
          value: [this.testRotateX, value, this.testRotateZ ]
        })
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
      },
      set: function (value) {
        this.$store.dispatch('setRotateInc', {
          axis: 'xyz',
          value: [this.testRotateX, this.testRotateY, value]
        })
      }
    },
    testRot: {
      get: function () {
        const {quat, mat4} = window.export_nehuba
        const xformMat = mat4.fromValues(...this.incTransformMatrix)
        const rotQuat = mat4.getRotation(quat.create(), xformMat)
        return Array.from(rotQuat)
      }
    },
    testTranslX: {
      get: function () {
        return this.testTransl[0] / 1e6
      },
      set: function (value) {
        this.$store.dispatch('setTranslInc', {
          axis: 'x', 
          value: value * 1e6
        })
      }
    },
    testTranslY: {
      get: function () {
        return this.testTransl[1] / 1e6
      },
      set: function (value) {
        this.$store.dispatch('setTranslInc', {
          axis: 'y', 
          value: value * 1e6
        })
      }
    },
    testTranslZ: {
      get: function () {
        return this.testTransl[2] / 1e6
      },
      set: function (value) {
        this.$store.dispatch('setTranslInc', {
          axis: 'z', 
          value: value * 1e6
        })
      }
    },
    testTransl: {
      get: function () {
        const {vec3, mat4} = window.export_nehuba
        const xformMat = mat4.fromValues(...this.incTransformMatrix)
        const translVec = mat4.getTranslation(vec3.create(), xformMat)
        const scaleVec = mat4.getScaling(vec3.create(), xformMat)
        vec3.divide(translVec, translVec, scaleVec)
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
    },
    /**
     * NYI, need deeper integration with backend on available template spaces
     */
    selectReference: function () {
      return this.$store.state.selectReference
    },
    selectTemplateText: function () {
      return this.$store.state.incomingTemplate
        ? this.$store.state.incomingTemplate.text
        : this.dummyIncomingTemplate.text
    }
  },
  watch: {
    incTransformMatrix: function (array) {

    },
    opacity: function (opacityVal) {
      this.$store.dispatch('changeOpacity', Number(opacityVal))
    },
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
    overlayColor: function () {
      this.overlayColorChanged()
    }
  },
  methods: {
    flipAxis: function (axis) {
      this.$store.dispatch('flipAxis', { axis })
    },
    scaleChanged: function () {
      this.$store.dispatch('changeScale', this.isotropic
        ? [this.scale, this.scale, this.scale]
        : [this.scaleX, this.scaleY, this.scaleZ]
      )
    },
    overlayColorChanged: function () {
      this.$store.dispatch('changeOverlayColor', this.overlayColor)
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
  padding-left: 1em;
  padding-right: 1.5em;
  padding-top: 3em;
  padding-bottom:0.5em;
  margin-bottom:0;

  transition: linear 150ms all;
}
.title:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
}
</style>
