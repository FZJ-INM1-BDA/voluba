<template>
  <div>
    <!-- label -->
    <label class = "mb-0">{{ name }}</label> 
    <div class = "input-group input-group-sm">

      <input
        style = "height: 100%;"
        v-model = "sliderValue"
        :disabled = "disabled"
        :step = "step"
        :max = "max"
        :min = "min"
        class = "form-control"
        type = "range" />
      
      <input
        @mousewheel="wheel"
        style = "flex: 0 0 4em;"
        v-model = "sliderValue"
        :min="min"
        :max="max"
        :step="step"
        type = "number"
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
  },
  methods: {
    wheel: function (event) {
      if (event.deltaY) {
        this.$emit( event.deltaY > 0 ? 'minus' : 'plus')
      }
    }
  }
};
</script>
<style scoped>
</style>
