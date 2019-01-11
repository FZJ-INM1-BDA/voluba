<template>
  <div id="sidebar">
    <div id="accordion" role="tablist">

      <card-component :initialVisibility = "true" :id = "'dataset'">
        <template slot = "header">
          <h6><strong>Step 1</strong></h6>
        </template>
        <template slot = "body">
          <p><strong><u>Data Selection</u></strong></p>
          <label>Reference volume:</label>
          <br>
          <select id="select-reference" v-model="selectReference">
            <option v-for="referenceURL in referenceURLs" :key="referenceURL.id" :value="referenceURL.value">
              {{ referenceURL.text }}
            </option>
          </select>
          <hr>
          <label>Template volume:</label>
          <br>
          <select id="select-template" v-model="selectTemplate">
            <option v-for="templateURL in renderedTemplateURLs" :key="templateURL.id" :value="templateURL.value">
              {{ templateURL.text }}
            </option>
          </select>
          <br><br>
          <b-button href="#" variant="secondary">
            <font-awesome-icon icon="upload"/>
            Upload
          </b-button>
          <br><br>
          <p><strong><u>Options</u></strong></p>
          <label>Overlay color:</label>
          <div style="background-color: yellow; max-width: 20px; min-height: 20px; border: 1px solid black;"></div>
          <label>Overlay opacity:</label>
          <input id="opacitySlider" class="slider" type="range" :min="scaleMin" :max="scaleMax" :step="scaleStep" :value="scale"/>
          <label>Scale:</label>
          <input id="scaleSlider" class="slider" type="range" :min="scaleMin" :max="scaleMax" :step="scaleStep" :value="scale"/>
          <input type="checkbox" name="vehicle1" value="Bike">Isotropic Scaling<br><br>
          <div class="btn-group">
            <div class="btn btn-primary">align reference</div>
            <div class="btn btn-primary">align incoming</div>
          </div>
          <br>
          <label>Mouse position:</label><br>
          <label>Current viewport:</label>
        </template>
      </card-component>

      <card-component :initialVisibility = "false" :id = "'registration'">
        <template slot = "header">
          <h6><strong>Step 2</strong></h6>
        </template>
        <template slot = "body">
          <label>Transformation type:</label>
          <br>
          <select id="select-transformation" v-model="selectTransformation">
            <option v-for="transformationType in transformationTypes" :key="transformationType.id"
                    :value="transformationType.value">
              {{ transformationType.text }}
            </option>
          </select>
          <br><br>
          <b-button href="#" variant="secondary">
            <font-awesome-icon icon="play-circle"/>
            Compute transformation
          </b-button>
          <hr>
          <b-container fluid>
            <b-row>
              <b-col md="5"><label>Determinant:</label></b-col>
              <b-col md="7"><input id="inputDeterminant" type="text" disabled/></b-col>
            </b-row>
            <b-row>
              <b-col md="5"><label>RMSE:</label></b-col>
              <b-col md="7"><input id="inputRMSE" type="text" disabled/></b-col>
            </b-row>
          </b-container>
          <br>
          <b-button href="#" variant="secondary">
            <font-awesome-icon icon="eye"/>
            Show transformation matrix
          </b-button>
        </template>
      </card-component>

      <card-component :initialVisibility = "false" :id = "'landmarkPairs'">
        <template slot = "header">
          <h6><strong>Step 3</strong></h6>
        </template>
        <template slot = "body">
          <b-card-body>
            <b-button href="#" variant="secondary">
            <font-awesome-icon icon="download"/>
            Save as JSON
          </b-button>
          <br><br>
          <b-button href="#" variant="secondary">
            <font-awesome-icon icon="file-export"/>
            Publish on HBP platform
          </b-button>
          </b-card-body>
        </template>
      </card-component>
    </div>
  </div>
</template>

<script>
import CardComponent from '@/components/Card'
export default {
  name: 'SidebarComponent',
  data () {
    return {
      referenceURLs: [
        { id: '1', text: 'BigBrain (2015)', value: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image' }
      ],
      templateURLs: [
        { id: '1', text: 'Nucleus subthalamicus (B20)', value: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/B20_stn_l/v10' },
        { id: '2', text: 'Hippocampus unmasked', value: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/hippocampus-unmasked' }
      ],
      transformationTypes: [
        { id: '1', text: 'Rigid', value: 'rigid' },
        { id: '2', text: 'Rigid (allow reflection)', value: 'rigid+reflection' },
        { id: '3', text: 'Similarity', value: 'similarity' },
        { id: '4', text: 'Similarity (allow reflection)', value: 'similarity+reflection' },
        { id: '5', text: 'Affine', value: 'affine' }
      ],
      selectReference: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image',
      selectTemplate: null,
      selectTransformation: 'rigid',
      scale: 1,
      scaleMin: 0.1,
      scaleMax: 10,
      scaleStep: 0.01,

      viewerNavigationState: null
    }
  },
  computed: {
    incomingMatrix: function () {
      return this.$store.state.incomingTransformMatrix
    },
    renderedTemplateURLs: function () {
      return [{id: null, text: '-- Please select a dataset --', value: null}].concat(this.templateURLs)
    },
    viewerNavigationPosition: function () {
      return this.$store.state.viewerNavigationPosition.join(', ')
    },
    viewerMousePosition: function () {
      return this.$store.state.viewerMousePosition.join(', ')
    },
    layers: function () {
      const layers = this.$store.state.layers
      if (!layers) {
        return []
      }
      const keys = Object.keys(layers)
      return keys.map(name => Object.assign({}, layers[name], {name}))
    },
    mouseoverUserlayer: function () {
      return this.$store.state.mouseoverUserlayer
    }
  },
  methods: {
    alignReference: function (event) {
      this.$store.dispatch('alignReference')
    },
    alignIncoming: function (event) {
      this.$store.dispatch('alignIncoming')
    }
  },
  watch: {
    selectTemplate: function (nst) {
      this.$store.commit('selectIncomingTemplate', nst)
    },
    scale: function (val) {
      this.$store.commit('setIncomingTemplateScale', [val, val, val])
    }
  },
  filters: {
  },
  components: {
    CardComponent
  }
}
</script>

<style scoped>
#sidebar {
  background-color: lightgray;
}

select, select option {
  min-width: 100%;
  max-width: 100%;
}

.slider {
  min-width: 100%;
  max-width: 100%;
}

#inputRMSE, #inputDeterminant  {
  max-width: 100%;
}

.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
