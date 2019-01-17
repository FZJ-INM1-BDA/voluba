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
        <b-button @click="computeTransformationMatrix" variant="secondary">
          <font-awesome-icon icon="play-circle"/>
          Compute transformation
        </b-button>
        <hr>
        <b-container fluid>
          <b-row>
            <b-col md="5"><label>Determinant:</label></b-col>
            <b-col md="7"><label style="background-color: lightgray; width: 100%;">{{ this.$store.state.landmarkDeterminant ? this.$store.state.landmarkDeterminant : '---' }}</label></b-col>
          </b-row>
          <b-row>
            <b-col md="5"><label>RMSE:</label></b-col>
            <b-col md="7"><label style="background-color: lightgray; width: 100%;">{{ this.$store.state.landmarkRMSE ? this.$store.state.landmarkRMSE : '---' }}</label></b-col>
          </b-row>
        </b-container>
        <br>
        <b-button variant="secondary" v-b-modal.transformationMatrixModal>
          <font-awesome-icon icon="eye"/>
          Show transformation matrix
        </b-button>
        <transformation-matrix-modal id="transformationMatrixModal" :transformationMatrix="this.$store.state.landmarkTransformationMatrix"></transformation-matrix-modal>
      </template>
    </card-component>

  </div>
</template>
<script>
import axios from 'axios';
import CardComponent from '@/components/Card'
import LandmarkList from '@/components/LandmarkList'
import TransformationMatrixModal from '../modals/TransformationMatrixModal'

// Vue-Color
import { Compact } from 'vue-color'

export default {
  components: {
    CardComponent,
    LandmarkList,
    TransformationMatrixModal,
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
      
    },
    computeDeterminant: function (matrix) {
      if(!matrix)
        return null
      if(matrix.length == 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      } else {
        var res = 0
        for(var i = 0; i < matrix.length; i++) {
          var minor = []
          for(var j = 0; j < matrix.length - 1; j++) {
            minor[j] = matrix[j + 1].slice(0, i).concat(matrix[j + 1].slice(i + 1, matrix.length))
          }
          var sign = 1 - 2 * (i % 2)
          res += sign * matrix[0][i] * this.computeDeterminant(minor)
        }
        return res
      }
    },
    computeTransformationMatrix: function () {
      var data = {}  // TODO: fill variable
      axios.post(this.$store.state.backendURL + "/least-squares", data)
      .then((response)  =>  {
        this.$store.dispatch('changeLandmarkTransformationMatrix', response.data.transformation_matrix)
        this.$store.dispatch('changeLandmarkInverseMatrix', response.data.inverse_matrix)
        this.$store.dispatch('changeLandmarkDeterminant', this.computeDeterminant(response.data.transformation_matrix))
        this.$store.dispatch('changeLandmarkRMSE', response.data.RMSE)
      }, (error)  =>  {
        console.log(error)
        // TODO: handle error!
      })
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
