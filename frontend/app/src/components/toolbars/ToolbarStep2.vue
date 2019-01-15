<template>
  <div id = "accordion" rol = "tablist">

    <!-- Landmark-Pairs -->
    <card-component :id = "'landmark-pairs'" :initialVisibility = "true">
      <template slot = "header">
        <h6><strong>Landmark-Pairs</strong></h6>
      </template>
      <template slot = "body">
        <input type="checkbox" id="synchronize-zoom" name="synchronize-zoom" v-model="synchronizeZoom" />
        <label for = "synchronize-zoom">Synchronize zoom</label>
        <div>
          <button type="button" @click = "loadLandmarkPairs" class="btn btn-default"><font-awesome-icon icon="file-upload"/> Load</button>
          <button type="button" @click = "saveLandmarkPairs" class="btn btn-default"><font-awesome-icon icon="file-download"/> Save</button>
        </div>
        <div>
          <button type="button" @click = "clearList" class="btn btn-danger"><font-awesome-icon icon="trash-alt"/> Remove all</button>
          <button type="button" @click = "addLandmarkPair" class="btn btn-success"><font-awesome-icon icon="plus"/> Add</button>
        </div>
        <landmark-list />
      </template>
    </card-component>

    <!-- Transformation -->
    <card-component :id = "'transformation'">
      <template slot = "header">
        <h6><strong>Transformation</strong></h6>
      </template>
      <template slot = "body">
        <label>Transformation type: </label>
        <br>
        <select
          @change = "selectMethod"
          id="select-transformation"
          :value = "selectTransformation">
          <option
            v-for = "transformationType in transformationTypes"
            :key = "transformationType.id"
            :value = "transformationType.value">
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

  </div>
</template>
<script>
import CardComponent from '@/components/Card'
import LandmarkList from '@/components/LandmarkList'

// Vue-Color
import { Compact } from 'vue-color'

export default {
  components: {
    CardComponent,
    LandmarkList,
    'compact-picker': Compact
  },
  data: function () {
    return {
      synchronizeZoom: false,
      checkAll: false,
    }
  },
  watch: {},
  computed: {
    transformationTypes: function () {
      return this.$store.state.transformationTypes
    },
    selectedTransformationIndex: function () {
      return this.$store.state.selectedTransformationIndex
    },
    selectTransformation: function () {
      const selectedTransform = this.$store.state.transformationTypes[this.$store.state.selectedTransformationIndex]
      return selectedTransform && selectedTransform.value
        ? selectedTransform.value
        : null
    }
  },
  methods: {
    selectMethod: function (event) {
      const index = event.target.selectedIndex
      this.$store.commit('selectMethodIndex', index)
    },
    loadLandmarkPairs: function () {

    },
    saveLandmarkPairs: function () {

    },
    clearList: function () {

    },
    addLandmarkPair: function () {
      
    }
  },
}
</script>
<style scoped>
.landmark-container
{
  background-color: white;
}
</style>
