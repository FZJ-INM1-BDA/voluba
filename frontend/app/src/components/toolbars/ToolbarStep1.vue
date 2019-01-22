<template>
  <div id = "accordion" rol = "tablist">

    <!-- Data Selection -->
    <card-component :id = "'data-selection'" :initialVisibility = "true">
      <template slot = "header">
        <h6><strong>Data Selection</strong></h6>
      </template>
      <template slot = "body">
        <label>Reference volume:</label>
        <!-- <br> -->
        <select
          :id = "'data-selection'"
          :value = "selectReference">
          <option v-for="referenceURL in referenceURLs" :key="referenceURL.id" :value="referenceURL.value">
            {{ referenceURL.text }}
          </option>
        </select>

        <hr>
        <label>Incoming volume: </label>
        <!-- <br> -->
        <select id="select-template" v-model = "selectTemplate">
          <option
            v-for = "incomingVolume in renderedIncomingVolumes"
            :key = "incomingVolume.id"
            :value = "incomingVolume.id">
            {{ incomingVolume.text }}
          </option>
        </select>
        <!-- <br><br> -->
        <b-button variant="secondary" v-b-modal.uploadModal>
          <font-awesome-icon icon="upload"/>
          Upload
        </b-button>
        <upload-modal id="uploadModal"></upload-modal>
        <!-- <br><br> -->
      </template>
    </card-component>

    <!-- Options -->
    <card-component id = "options">
      <template slot = "header">
        <h6><strong>Anchoring Options</strong></h6>
      </template>
      <template slot = "body">

        <!-- color -->
        <div class="option-container">
          <label for="colorPicker" class="option-label">color</label>
          <div class="option-input">
            <div @click.stop = "showOverlayColor = !showOverlayColor" :style="{'background-color': overlayColor.hex, 'min-width': '20px', 'max-width': '20px', 'min-height': '20px', 'border': '1px solid black'}" v-b-tooltip.hover :title="overlayColor.hex"></div>
            <compact-picker v-if = "showOverlayColor" v-model="overlayColor" />
          </div>
        </div>

        <!-- opacity -->
        <div class="option-container">
          <label for="opacitySlider" class="option-label">opacity</label>
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
        <div v-if = "isotropic" class="option-container">
          <label for="scaleSlider" class="option-label">scale</label>
          <div class="option-input">
            <input
              name = "scaleSlider"
              id = "scaleSlider"
              class = "slider"
              type = "range"
              :min = "scaleMin"
              :max = "scaleMax"
              :step = "scaleStep"
              v-model = "scale"/>
          </div>
          <div class="option-value">
            {{ Number(scale).toFixed(2) }}
          </div>
        </div>

        <!-- non-isotropic scale -->
        <div v-if = "!isotropic" class="option-container">
          <label for="scaleSlider" class="option-label">scale x</label>
          <div class="option-input">
            <input
              name = "scaleSlider"
              id = "scaleSlider"
              class = "slider"
              type = "range"
              :min = "scaleMin"
              :max = "scaleMax"
              :step = "scaleStep"
              v-model = "scaleX"/>
          </div>
          <div class="option-value">
            {{ Number(scaleX).toFixed(2) }}
          </div>
        </div>
        <div v-if = "!isotropic" class="option-container">
          <label for="scaleSlider" class="option-label">scale y</label>
          <div class="option-input">
            <input
              name = "scaleSlider"
              id = "scaleSlider"
              class = "slider"
              type = "range"
              :min = "scaleMin"
              :max = "scaleMax"
              :step = "scaleStep"
              v-model = "scaleY"/>
          </div>
          <div class="option-value">
            {{ Number(scaleY).toFixed(2) }}
          </div>
        </div>
        <div v-if = "!isotropic" class="option-container">
          <label for="scaleSlider" class="option-label">scale z</label>
          <div class="option-input">
            <input
              name = "scaleSlider"
              id = "scaleSlider"
              class = "slider"
              type = "range"
              :min = "scaleMin"
              :max = "scaleMax"
              :step = "scaleStep"
              v-model = "scaleZ"/>
          </div>
          <div class="option-value">
            {{ Number(scaleZ).toFixed(2) }}
          </div>
        </div>
        <input type="checkbox" id = "isotropic" name="isotropic" v-model = "isotropic" />
        <label for = "isotropic">
          isotropic scale
        </label>

        <!-- flip left/right -->
        <div class="option-container">
          <b-button @click="flipLeftRight" variant="secondary">flip left/right</b-button>
        </div>

        <!-- flip inferior/superio -->
        <div class="option-container">
          <b-button @click="flipInferiorSuperior" variant="secondary">flip inferior/superior</b-button>
        </div>

        <!-- flip anterior/posterior -->
        <div class="option-container">
          <b-button @click="flipAnteriorPosterior" variant="secondary">flip anterior/posterior</b-button>
        </div>

        <!-- align -->
        <div class="btn-group">
          <div @click = "alignReference" class="btn btn-primary">align reference</div>
          <div @click = "alignIncoming" class="btn btn-primary">align incoming</div>
        </div>
        <br>
        <label>Mouse position: {{ viewerMouse.join(', ') }} </label>
      </template>
    </card-component>
  </div>
</template>
<script>
import CardComponent from '../Card'
import UploadModal from '../modals/UploadModal'

// Vue-Color
import { Compact } from 'vue-color'

export default {
  components: {
    CardComponent,
    UploadModal,
    'compact-picker': Compact
  },
  data: function () {
    return {
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
      showOverlayColor: false
    }
  },
  computed: {
    dummyIncomingTemplate: function () {
      return {
        id: 'placeholder',
        text: '-- Please select a dataset --',
        value: -1
      }
    },
    selectTemplate: {
      get: function () {
        return this.$store.state.selectedIncomingVolumeIndex !== null
          ? this.$store.state.incomingVolumes[this.$store.state.selectedIncomingVolumeIndex].id
          : this.dummyIncomingTemplate.id
      },
      set: function (id) {
        this.$store.dispatch('selectIncomingVolume', id === this.dummyIncomingTemplate.id ? null : id)
      }
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
    },
    viewerMouse: function () {
      return this.$store.state.viewerMousePosition
    }
  },
  watch: {
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
    alignReference: function () {
      this.$store.dispatch('alignReference')
    },
    alignIncoming: function () {
      this.$store.dispatch('alignIncoming')
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
</style>
