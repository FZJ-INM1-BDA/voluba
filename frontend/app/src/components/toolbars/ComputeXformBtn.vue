<template>
  
    <div
      @click="computeXform"
      v-b-tooltip.right.hover="computeXformTooltipText"
      :class="computeXformBtnClass"
      class="rounded-circle btn btn-sm">
      <font-awesome-icon
        :class="backendQueryInProgress ? 'spinner' : ''"
        :icon="computeXformBtnIcon" />
    </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  computed: {
    ...mapState({
      backendQueryInProgress: 'backendQueryInProgress',
      backendQueryError: 'backendQueryError',
      ableToComputeTransformationMatrix: state => state.landmarkPairs.length >= 3
    }),
    computeXformBtnClass: function () {
      return this.backendQueryInProgress
        ? 'lmr-disabled btn-primary'
        : !this.ableToComputeTransformationMatrix
          ? 'lmr-disabled btn-primary'
          : this.backendQueryError
            ? 'btn-danger'
            : 'btn-primary'
    },
    computeXformBtnIcon: function () {
      return this.backendQueryInProgress
        ? 'spinner'
        : this.backendQueryError
          ? `exclamation-triangle`
          : 'calculator'
    },
    computeXformTooltipText: function () {
      return this.backendQueryError
        ? 'Error connecting to the calculating server. Retry?'
        : this.ableToComputeTransformationMatrix
          ? 'Compute and display transform based on landmarks.' 
          : 'Need at least three (3) active landmarks to compute transformation.'
    }
  },
  methods: {
    ...mapActions({
      computeXform: 'computeXform',
    })
  },
}
</script>
<style scoped>
.lmr-disabled
{
  opacity: 0.5;
}

.btn.lmr-disabled:hover
{
  cursor: default;
}

.btn-transition
{
  transition: all 0.5s linear;
}
</style>
