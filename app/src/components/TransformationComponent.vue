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
        v-model="selectTransformation">
        <option
          v-for="transformationType in transformationTypes"
          :key="transformationType.id"
          :value="transformationType.value">
          {{ transformationType.text }}
        </option>
      </select>
    </div>
  </div>

</template>
<script>
/**
 * TODO 
 * insert before apply xform
 */
import axios from 'axios'
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters('linearStore', [
      'selectedTransformationType'
    ]),
    ...mapState('linearStore', [
      'transformationTypes'
    ]),
    selectedTransformType: {
      get: function () {
        return this.selectedTransformationType.value
      }, 
      set: function (value) {
        this.selecMethodViaValue({ value })
      }
    }
  },
  methods: {
    ...mapMutations('linearStore', [
      'setMethodIndex'
    ]),
    ...mapActions('linearStore', [
      'computeTransformResponseReceived',
      'selecMethodViaValue'
    ])
  }
}
</script>
<style scoped>

</style>
