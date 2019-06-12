<template>
  <div style="display: flex; align-items: center;">
    <label class = "mb-0">{{ name }}</label> 
    <input
        @mousewheel="wheel"
        v-model = "sliderValueZero"
        :min="min"
        :max="max"
        :step="step"
        type = "number"
        :disabled = "disabled"
        class="slider-input">
<div class='multi-range' data-lbound='0.35' data-ubound='75'>
      <hr />
    <input type='range' 
        @mousewheel="wheel"
        v-model = "sliderValueZero"
        :disabled = "disabled"
        :step = "step"
        :max = "max"
        :min = "min"
        oninput='this.parentNode.dataset.lbound=this.value;'
    />
    <input type='range' 
            @mousewheel="wheel"
            v-model = "sliderValue"
            :disabled = "disabled"
            :step = "step"
            :max = "max"
            :min = "min"
           oninput='this.parentNode.dataset.ubound=this.value;'
    />
</div>
    <input
        @mousewheel="wheel"
        v-model = "sliderValue"
        :min="min"
        :max="max"
        :step="step"
        type = "number"
        :disabled = "disabled"
        class="slider-input">
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      sliderValueZero: 0.20
      }
  },
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
    },
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
.slider-input {
  height: 28px;
  max-width: 60px;
}
.multi-range, .multi-range * { box-sizing: border-box; padding: 0; margin: 0; }
.multi-range { 
    position: relative; width: 160px; height: 28px; margin: 16px;
    border: 1px solid #ddd; font-family: monospace;
}
.multi-range > hr { position: absolute; width: 100%; top: 50%; }
.multi-range > input[type=range] {
    width: calc(100% - 16px); 
    position: absolute; bottom: 6px; left: 0;
}
.multi-range > input[type=range]:last-of-type { margin-left: 16px; }
.multi-range > input[type=range]::-webkit-slider-thumb { transform: translateY(-18px); }
.multi-range > input[type=range]::-webkit-slider-runnable-track { -webkit-appearance: none; height: 0px; }
.multi-range > input[type=range]::-moz-range-thumb { transform: translateY(-18px); }
.multi-range > input[type=range]::-moz-range-track { -webkit-appearance: none; height: 0px; }
.multi-range > input[type=range]::-ms-thumb { transform: translateY(-18px); }
.multi-range > input[type=range]::-ms-track { -webkit-appearance: none; height: 0px; }
</style>
