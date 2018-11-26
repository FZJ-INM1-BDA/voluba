<template>
  <div id="sidebar">
    <div id="accordion" role="tablist">
      <b-card no-body>
        <b-card-header header-tag="header" role="tab">
          <a v-b-toggle.collapse-datasets>
            <font-awesome-icon icon="angle-left" pull="right" class="when-closed"/>
            <font-awesome-icon icon="angle-down" pull="right" class="when-opened"/>
            <h6><strong>Datasets</strong></h6>
          </a>
        </b-card-header>
        <b-collapse id="collapse-datasets" visible>
          <b-card-body>
            <label>Select a reference volume:</label>
            <br>
            <select id="select-reference" v-model="selectReference">
              <option v-for="referenceURL in referenceURLs" :key="referenceURL.id" :value="referenceURL.value">
                {{ referenceURL.text }}
              </option>
            </select>
            <hr>
            <label>Select a template volume:</label>
            <br>
            <select id="select-template" v-model="selectTemplate">
              <option v-for="templateURL in templateURLs" :key="templateURL.id" :value="templateURL.value">
                {{ templateURL.text }}
              </option>
            </select>
            <br><br>
            <b-button href="#" variant="secondary">
              <font-awesome-icon icon="upload"/>
              Upload
            </b-button>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body>
        <b-card-header header-tag="header" role="tab">
          <a v-b-toggle.collapse-registration>
            <font-awesome-icon icon="angle-left" pull="right" class="when-closed"/>
            <font-awesome-icon icon="angle-down" pull="right" class="when-opened"/>
            <h6><strong>Registration</strong></h6>
          </a>
        </b-card-header>
        <b-collapse id="collapse-registration">
          <b-card-body></b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body>
        <b-card-header header-tag="header" role="tab">
          <a v-b-toggle.collapse-landmark-pairs>
            <font-awesome-icon icon="angle-left" pull="right" class="when-closed"/>
            <font-awesome-icon icon="angle-down" pull="right" class="when-opened"/>
            <h6><strong>Landmark pairs</strong></h6>
          </a>
        </b-card-header>
        <b-collapse id="collapse-landmark-pairs">
          <b-card-body></b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body>
        <b-card-header header-tag="header" role="tab">
          <a v-b-toggle.collapse-transformation>
            <font-awesome-icon icon="angle-left" pull="right" class="when-closed"/>
            <font-awesome-icon icon="angle-down" pull="right" class="when-opened"/>
            <h6><strong>Transformation</strong></h6>
          </a>
        </b-card-header>
        <b-collapse id="collapse-transformation">
          <b-card-body>
            <label>Select a transformation type:</label>
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
                <b-col md="7"><input type="text" disabled/></b-col>
              </b-row>
              <b-row class="my-1">
                <b-col md="5"><label>RMSE:</label></b-col>
                <b-col md="7"><input type="text" disabled/></b-col>
              </b-row>
            </b-container>
            <b-button href="#" variant="secondary">
              <font-awesome-icon icon="eye"/>
              Show transformation matrix
            </b-button>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarComponent',
  data () {
    return {
      referenceURLs: [
        { id: '1', text: 'BigBrain (2015)', value: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image' }
      ],
      templateURLs: [
        { id: '1', text: 'Nucleus subthalamicus (B20)', value: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/B20_stn_l/isotropic-raw' },
        { id: '2', text: 'Hippocampus unmasked', value: 'TODO' }
      ],
      transformationTypes: [
        { id: '1', text: 'Rigid', value: 'rigid' },
        { id: '2', text: 'Rigid (allow reflection)', value: 'rigid+reflection' },
        { id: '3', text: 'Similarity', value: 'similarity' },
        { id: '4', text: 'Similarity (allow reflection)', value: 'similarity+reflection' },
        { id: '5', text: 'Affine', value: 'affine' }
      ],
      selectReference: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image',
      selectTemplate: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/B20_stn_l/isotropic-raw',
      selectTransformation: 'rigid'
    }
  },
  methods: {}
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

input {
  max-width: 100%;
}

.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
