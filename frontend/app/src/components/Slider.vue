<template>
  <div>
    <!-- label -->
    <label class = "mb-0">{{ name }}</label> 
    <div class = "input-group input-group-sm">

      <div class = "input-group-prepend">
        <div
          :disabled = "disabled"
          @click = "$emit('minus')"
          class = "btn btn-sm btn-outline-secondary">
          <font-awesome-icon icon = "minus"/>
        </div>
      </div>

      <input
        style = "height: 100%;"
        v-model = "sliderValue"
        :disabled = "disabled"
        :step = "step"
        :max = "max"
        :min = "min"
        class = "form-control"
        type = "range" />
      
      <div class="input-group-append">
        <div
          :disabled = "disabled"
          @click = "$emit('plus')"
          class = "btn btn-sm btn-outline-secondary">
          <font-awesome-icon icon = "plus" />
        </div>
      </div>
      <input
        style = "flex: 0 0 4em;"
        v-model = "sliderValue"
        type = "text"
        :disabled = "disabled"
        class = "form-control">

      <div
        v-if = "unit"
        class = "input-group-append">
        <span
          class = "input-group-text">
          {{ unit }}
        </span>
      </div>
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
    unit: String,
    disabled: Boolean
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
  }
};
</script>
<style scoped>
</style>
