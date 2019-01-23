<template>
  <div class="input-group input-group-sm">

    <div class="input-group-prepend">
      <span class="input-group-text">{{ name }}</span>
      <div
        @click="$emit('minus')"
        class="btn btn-sm btn-outline-secondary">
        <font-awesome-icon icon="minus"/>
      </div>
    </div>

    <input
      style = "height: 100%;"
      v-model="sliderValue"
      :step="step"
      :max="max"
      :min="min"
      class="form-control"
      type="range" />
    
    <div class="input-group-append">
      <div
        @click="$emit('plus')"
        class="btn btn-sm btn-outline-secondary">
        <font-awesome-icon icon="plus" />
      </div>
    </div>
    <input v-model="sliderValue" type="text" class="form-control">

    <div
      v-if = "unit"
      class="input-group-append">
      <span
        class="input-group-text">
        {{ unit }}
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    name: String,
    min: Number,
    max: Number,
    step: Number,
    value: Number,
    unit: String
  },
  computed: {
    sliderValue: {
      get: function() {
        return this.value.toFixed(2);
      },
      set: function(value) {
        const num = Number(value);
        /**
         * check num out of bound
         * check num isNaN
         */
        this.$emit("sliderInput", num);
      }
    }
  },
  watch: {}
};
</script>
<style scoped>
</style>
