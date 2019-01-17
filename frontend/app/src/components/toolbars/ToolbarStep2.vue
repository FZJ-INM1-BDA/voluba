<template>
  <div id = "accordion" rol = "tablist">

    <!-- Landmark-Pairs -->
    <card-component :id = "'landmark-pairs'" :initialVisibility = "true">
      <template slot = "header">
        <h6><strong>Landmark-Pairs</strong></h6>
      </template>
      <template slot = "body">
        <div>
          <input type="checkbox" id="synchronize-zoom" name="synchronize-zoom" v-model="synchronizeZoom"/>
          <label for="synchronize-zoom">Synchronize Zoom</label>
        </div>
        <div>
          <input type="checkbox" id="synchronize-cursor" name="synchronize-cursor" v-model="synchronizeCursor"/>
          <label for="synchronize-cursor">Synchronize Cursor</label>
        </div>
        <div>
          <input type="checkbox" id="preview-mode" name="preview-mode" v-model="previewMode"/>
          <label for="preview-mode">Preview Mode</label>
        </div>
        <div>
          <button type="button" @click = "loadLandmarkPairs" class="btn btn-default"><font-awesome-icon icon="file-upload"/> Load</button>
          <button type="button" @click = "saveLandmarkPairs" class="btn btn-default"><font-awesome-icon icon="file-download"/> Save</button>
        </div>
        <div>
          <button type="button" @click = "clearList" class="btn btn-danger" :disabled="this.$store.state.landmarkPairs.length == 0"><font-awesome-icon icon="trash-alt"/> Remove all</button>
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
        <b-button @click="computeTransformationMatrix" :disabled="this.$store.state.landmarkPairs.length < 3" variant="secondary">
          <font-awesome-icon icon="play-circle"/>
          Compute transformation
        </b-button>
        <hr>
        <b-container fluid>
          <b-row>
            <b-col md="5"><label>Determinant:</label></b-col>
            <b-col md="7"><label style="background-color: lightgray; width: 100%;">{{ this.$store.state.landmarkDeterminant ? (this.$store.state.landmarkDeterminant).toFixed(10) : '---' }}</label></b-col>
          </b-row>
          <b-row>
            <b-col md="5"><label>RMSE:</label></b-col>
            <b-col md="7"><label style="background-color: lightgray; width: 100%;">{{ this.$store.state.landmarkRMSE ? (this.$store.state.landmarkRMSE).toFixed(10) : '---' }}</label></b-col>
          </b-row>
        </b-container>
        <br>
        <b-button variant="secondary" :disabled="!this.$store.state.landmarkTransformationMatrix" v-b-modal.transformationMatrixModal>
          <font-awesome-icon icon="eye"/>
          Show transformation matrix
        </b-button>
        <transformation-matrix-modal id="transformationMatrixModal" :transformationMatrix="this.$store.state.landmarkTransformationMatrix"></transformation-matrix-modal>
      </template>
    </card-component>

  </div>
</template>
<script>
import axios from 'axios'
import CardComponent from '@/components/Card'
import LandmarkList from '@/components/LandmarkList'
import TransformationMatrixModal from '../modals/TransformationMatrixModal'
import { oldJson } from '@/components/constants'

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
      synchronizeZoom: this.$store.state.synchronizeZoom,
      synchronizeCursor: this.$store.state.synchronizeCursor,
      checkAll: false
    }
  },
  watch: {
    synchronizeZoom: function () {
      this.enableSynchronizeZoom()
    },
    synchronizeCursor: function () {
      this.enableSynchronizeCursor()
    },
    checkAll: function () {
      this.checkAllPairs()
    }
  },
  computed: {
    previewMode: {
      set: function (val) {
        this.$store.dispatch('enablePreviewMode', val)
      },
      get: function () {
        return this.$store.state.previewMode
      }
    },
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
    },
    computedTransformationAvailable: function () {
      return this.$store.state.landmarkTransformationMatrix
    }
  },
  methods: {
    enableSynchronizeZoom: function () {
      this.$store.dispatch('enableSynchronizeZoom', this.synchronizeZoom)
    },
    enableSynchronizeCursor: function () {
      this.$store.dispatch('enableSynchronizeCursor', this.synchronizeCursor)
    },
    checkAllPairs: function () {
      // TODO: implement
    },
    selectMethod: function (event) {
      const index = event.target.selectedIndex
      this.$store.commit('selectMethodIndex', index)
    },
    loadLandmarkPairs: function () {
      this.$store.dispatch('loadOldJson', {
        json: oldJson,
        config: {
          fixCenterTranslation: true
        }
      })
    },
    saveLandmarkPairs: function () {
    },
    clearList: function () {
      this.$store.dispatch('removeLandmarkPairs')
    },
    addLandmarkPair: function () {
      this.$store.dispatch('addLandmarkPair')
    },
    computeDeterminant: function (matrix) {
      if (!matrix) {
        return null
      }
      if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
      } else {
        var res = 0
        for (var i = 0; i < matrix.length; i++) {
          var minor = []
          for (var j = 0; j < matrix.length - 1; j++) {
            minor[j] = matrix[j + 1].slice(0, i).concat(matrix[j + 1].slice(i + 1, matrix.length))
          }
          var sign = 1 - 2 * (i % 2)
          res += sign * matrix[0][i] * this.computeDeterminant(minor)
        }
        return res
      }
    },
    createBackendData: function () {
      var data = {
        'landmark_pairs': [],
        'source_image': this.$store.state.selectReference,
        'target_image': this.$store.state.selectTemplate,
        'transformation_type': this.$store.state.transformationTypes[this.$store.state.selectedTransformationIndex].value
      }

      for (var i = 0; i < this.$store.state.landmarkPairs.length; i++) {
        var landmark_pair = this.$store.state.landmarkPairs[i]
        var ref_landmarks = this.$store.state.referenceLandmarks.filter(p => p.id === landmark_pair.refId)
        var inc_landmarks = this.$store.state.incomingLandmarks.filter(p => p.id === landmark_pair.incId)

        if (ref_landmarks.length > 0 && inc_landmarks.length > 0) {
          var obj = {
            'active': landmark_pair.active,
            'colour': landmark_pair.color,
            'name': landmark_pair.name,
            'source_point': ref_landmarks[0].coord,
            'target_point': inc_landmarks[0].coord
          }
          data['landmark_pairs'].push(obj)
        }
      }
      return data
    },
    computeTransformationMatrix: function () {
      var data = this.createBackendData()
      console.log(data)
      axios.post(this.$store.state.backendURL + '/least-squares', data)
        .then(response => {
          this.$store.dispatch('changeLandmarkTransformationMatrix', response.data.transformation_matrix)
          this.$store.dispatch('changeLandmarkInverseMatrix', response.data.inverse_matrix)
          this.$store.dispatch('changeLandmarkDeterminant', this.computeDeterminant(response.data.transformation_matrix))
          this.$store.dispatch('changeLandmarkRMSE', response.data.RMSE)
        }, error => {
          console.log(error)
          // TODO: handle error!
        })
    }
  }
}
</script>
<style scoped>
.landmark-container
{
  background-color: white;
}
</style>
