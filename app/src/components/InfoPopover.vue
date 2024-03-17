<template>
  <div
    class="d-inline-block btn-sm"
    ref="infoIcon">
    <font-awesome-icon :icon="icon" />
    <b-tooltip :target="() => $refs['infoIcon']" :placement="placement" :triggers="triggers">
      <div
        class="mh-20-em overflow-auto"
        v-if="popoverObj">
        <div
          class="text-left"
          :key="key"
          v-for="(value, key) in popoverObj">
          {{ key }}
          <div class="text-muted">
            {{ value ? value : 'null' }}
          </div>
        </div>
      </div>
      <slot>
      </slot>
    </b-tooltip>
  </div>
</template>
<script>
export default {
  props: {
    placement: {
      type: String,
      default: 'auto'
    },
    triggers: {
      type: String,
      default: 'hover'
    },
    icon: {
      type: String,
      default: 'info-circle'
    },
    popoverObj: Object
  }
}
</script>
<style scoped>

</style>
