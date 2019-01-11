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
        <select :id = "'data-selection'" :value = "selectReference">
          <option v-for="referenceURL in referenceURLs" :key="referenceURL.id" :value="referenceURL.value">
            {{ referenceURL.text }}
          </option>
        </select>
        <hr>
        <label>Incoming volume: </label>
        <!-- <br> -->
        <select id="select-template" v-model = "selectTemplate">
          <option v-for="templateURL in renderedTemplateURLs" :key="templateURL.id" :value="templateURL.value">
            {{ templateURL.text }}
          </option>
        </select>
        <!-- <br><br> -->
        <b-button href="#" variant="secondary">
          <font-awesome-icon icon="upload"/>
          Upload
        </b-button>
        <!-- <br><br> -->
      </template>
    </card-component>

    <!-- Options -->
    <card-component id = "options">
      <template slot = "header">
        <h6><strong>Anchoring Options</strong></h6>
      </template>
      <template slot = "body">
        <div>
          <label>Overlay color:</label>
          <div style="background-color: yellow; max-width: 20px; min-height: 20px; border: 1px solid black;"></div>
        </div>
        <div>
          <label>Overlay opacity: {{ opacity }}</label>
          <input 
            id = "opacitySlider" 
            class = "slider" 
            type = "range" 
            :min = "opacityMin" 
            :max = "opacityMax" 
            :step = "opacityStep" 
            v-model = "opacity"/>
        </div>
        
        <div>
          <label>Scale: {{ scale }}</label>
          <input 
            id = "scaleSlider" 
            class = "slider" 
            type = "range" 
            :min = "scaleMin" 
            :max = "scaleMax" 
            :step = "scaleStep" 
            v-model = "scale"/>
        </div>
        
        <input type="checkbox" name="vehicle1" value="Bike">Isotropic Scaling<br><br>
        <div class="btn-group">
          <div @click = "alignReference" class="btn btn-primary">align reference</div>
          <div @click = "alignIncoming" class="btn btn-primary">align incoming</div>
        </div>
        <br>
        <label>Mouse position: {{ viewerMouse.join(', ') }} </label><br>
        <label>Current viewport: {{ viewerNavigation.join(', ') }}</label>
      </template>
    </card-component>
  </div>
</template>
<script>
import CardComponent from '../Card'
export default {
  components: {
    CardComponent
  },
  data: function () {
    return {
      
      scale: 1,
      scaleMin: 0.1,
      scaleMax: 10,
      scaleStep: 0.01,

      opacity: 0.5,
      opacityMin: 0,
      opacityMax: 1.0,
      opacityStep: 0.01,

      selectTemplate: null,
      dummyIncomingTemplate: {id: null, text: '-- Please select a dataset --', value: null}
    }
  },
  computed: {
    referenceURLs: function () {
      return this.$store.state.referenceURLs
    },
    renderedTemplateURLs: function () {
      return [this.dummyIncomingTemplate].concat(this.$store.state.templateURLs)
    },
    selectReference: function () {
      return this.$store.state.selectReference
    },
    selectTemplateText: function () {
      return this.$store.state.incomingTemplate
        ? this.$store.state.incomingTemplate.text
        : this.dummyIncomingTemplate.text
    },
    viewerNavigation: function () {
      return this.$store.state.viewerNavigationPosition
    },
    viewerMouse: function () {
      return this.$store.state.viewerMousePosition
    }
  },
  watch: {
    selectTemplate: function (nst) {
      this.$store.commit('selectIncomingTemplate', nst)
    },
    opacity: function (opacityVal) {
      this.$store.dispatch('changeOpacity', Number(opacityVal))
    },
    scale: function (scaleVal) {
      this.$store.dispatch('changeScale', scaleVal)
    }
  },
  methods: {
    alignReference: function () {
      this.$store.dispatch('alignReference')
    },
    alignIncoming: function () {
      this.$store.dispatch('alignIncoming')
    }
  }
}
</script>
<style scoped>

</style>
