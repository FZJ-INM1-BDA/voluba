<template>
  <div class="icon-container">
    <font-awesome-icon class = "icon" icon = "map-marker-alt" />
  </div>
</template>
<script>
export default {
  props: {
    zOffset: {
      type: Number,
      default: 0
    },
    overwriteStyle: {
      type: Object,
      default: function () {
        return {}
      }
    }
  }
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
  color: yellow;
  filter: drop-shadow(
    0 0 0.2em black
  )
}
</style>
