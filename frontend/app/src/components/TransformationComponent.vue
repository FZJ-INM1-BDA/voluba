<template>
  <div class="card bg-light">
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text">
          Transformation type
        </span>
      </div>
      
      <select
        class="form-control"
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
    </div>

    <b-button
      @click="computeTransformationMatrix"
      :disabled="!ableToComputeTransformationMatrix"
      variant="secondary">
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
    <b-button
      variant="secondary"
      :disabled="!this.$store.state.landmarkTransformationMatrix"
      v-b-modal.transformationMatrixModal>
      <font-awesome-icon icon="table"/>
      Show transformation matrix
    </b-button>

    <b-button
      :disabled="!computedTransformationResultAvailable"
      @click="applyCalculatedTransform"
      variant="info">
      <font-awesome-icon icon="eye" />
      Apply calculated transform
    </b-button>

  </div>

</template>
<script>
import axios from 'axios'
export default {
  data: function () {
    return {
      computeInProgress: false
    }
  },
  computed: {
    selectedTransformationIndex: function () {
      return this.$store.state.selectedTransformationIndex
    },
    selectTransformation: function () {
      const selectedTransform = this.$store.state.transformationTypes[this.$store.state.selectedTransformationIndex]
      return selectedTransform && selectedTransform.value
        ? selectedTransform.value
        : null
    },
    transformationTypes: function () {
      return this.$store.state.transformationTypes
    },
    computedTransformationResultAvailable: function () {
      return this.$store.state.landmarkInverseMatrix !== null
    }
  },
  methods: {
    applyCalculatedTransform: function () {
      const { mat4 } = window.export_nehuba

      const transformM = this.$store.state.landmarkTransformationMatrix
      const inverseM = this.$store.state.landmarkInverseMatrix
      const flattenedMatrix = inverseM.flatMap((arr, arrI) => arr.map((v, elIdx) => elIdx === 3 && arrI !== 3 ? v * 1e6 : v ))
      const transposedM = mat4.transpose(mat4.create(), mat4.fromValues(...flattenedMatrix))
      this.$store.commit('setIncTransformMatrix', Array.from(transposedM))
      
    },
    selectMethod: function (event) {
      const index = event.target.selectedIndex
      this.$store.commit('selectMethodIndex', index)
    },
    ableToComputeTransformationMatrix: function () {
      return this.$store.state.landmarkPairs.filter(lp => lp.active === true).length >= 3
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
      const lmPairs = this.$store.state.landmarkPairs
        .map(pair => {
          const refLm = this.$store.state.referenceLandmarks.find(rLm => rLm.id === pair.refId)
          const incLm = this.$store.state.incomingLandmarks.find(iLm => iLm.id === pair.incId)
          return refLm && incLm
            ? {
              active: pair.active,
              colour: pair.active,
              name: pair.name,
              'source_point': refLm.coord,
              'target_point': incLm.coord
            }
            : null
        })
        .filter(lm => lm !== null)

      return {
        'source_image': this.$store.state.selectReference,
        'target_image': this.$store.state.selectTemplate,
        'transformation_type': this.$store.state.transformationTypes[this.$store.state.selectedTransformationIndex].value,
        'landmark_pairs': lmPairs
      }
    }
  }
}
</script>
<style scoped>

</style>
