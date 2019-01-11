<template>
  <b-card-body class = "landmark-container">
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
  </b-card-body>
</template>
<script>
export default {
  watch: {

  },
  computed: {
    transformationTypes: function () {
      return this.$store.state.transformationTypes
    },
    selectedTransformationIndex: function () {
      return this.$store.state.selectedTransformationIndex
    },
    selectTransformation: function () {
      const selectedTransform = this.$store.state.transformationTypes[
        this.$store.state.selectedTransformationIndex
      ]
      return selectedTransform && selectedTransform.value
        ? selectedTransform.value
        : null
    }
  },
  methods: {
    selectMethod: function (event) {
      const index = event.target.selectedIndex
      this.$store.commit('selectMethodIndex', index)
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
