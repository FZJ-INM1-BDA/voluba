<template>
  <div :style = "styleLandmark" class="icon-container">
    <font-awesome-icon :style = "{ color }" class = "icon" icon = "map-marker-alt" />
  </div>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: true  
    },
    active: {
      type :Boolean,
      default: true
    },
    zOffset: {
      type: Number,
      default: 0
    },
    overwriteStyle: {
      type: Object,
      default: function () {
        return {}
      }
    },
    color: {
      type: String | Object,
      default: function () {
        return 'yellow'
      }
    }
  },
  computed: {
    styleLandmark: function () {
      return {
        opacity: this.active ? '1.0' : '0.3',
        display: this.visible ? 'block' : 'none'
      }
    }
  },
}
</script>
<style scoped>
.icon-container
{
  width: 0px;
  height: 0px;
  margin-left: -0.5em;
  margin-top: -1em;
  overflow: visible;
}
.icon
{
  filter: drop-shadow(
    0 0 0.2em black
  )
}
</style>
