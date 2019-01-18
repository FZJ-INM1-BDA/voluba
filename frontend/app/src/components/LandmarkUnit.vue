<template>
  <div :style = "styleLandmark" class="icon-container">
    <font-awesome-icon :style = "iconStyle" class = "icon" icon = "map-marker-alt" />
    <div :style = "stalkStyle" class = "stalk" />
  </div>
</template>
<script>
export default {
  props: {
    active: {
      type: Boolean,
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
        color: this.color
      }
    },
    iconStyle: function () {
      return {
        transform: `translateY(${-this.zOffset}px)`
      }
    },
    stalkStyle: function () {
      return {
        backgroundColor: this.color,
        height: `${Math.abs(this.zOffset)}px`,
        marginTop: this.zOffset > 0
          ? `${-this.zOffset}px`
          : `0px`
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
  overflow: visible;
  position: relative;
}
.icon
{
  width: 1em;
  height: 1em;
  margin-left: -0.5em;
  margin-top: -1em;
  filter: drop-shadow(
    0 0 0.2em black
  );
  position:absolute;
  left: 0;
  top: 0;
}
.stalk
{
  width: 1px;
  box-shadow: 0 4px 6px 0 rgba(0,0,0,0.5);
  position:absolute;
  left: 0;
  top: 0
}
</style>
