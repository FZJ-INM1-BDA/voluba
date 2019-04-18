<template>
  <path
    class="path"
    @mouseenter="$emit('mouseenterPath')"
    @mouseleave="$emit('mouseleavePath')"
    @mousedown="$emit('mousedownPath')"
    :fill="pathFill"
    :style="pathStyle"
    :d="pathD">
  </path>
</template>
<script>
export default {
  props: {
    center: {
      type: Array,
      default: () => [0, 0]
    },
    width: {
      type: Number,
      default: 50
    },
    xformCoord: {
      type: Function,
      default: function (coord) {
        return coord
      }
    },
    pathFill: {
      type: String,
      default: 'none'
    },
    pathStyle: {
      type: Object,
      default: function () {
        return {
          fill: 'none',
          stroke: 'blue',
          'stroke-width': 10
        }
      }
    }
  },
  computed: {
    hr: function () {
      return this.width / 4
    },
    radius: function () {
      return this.width / 2
    },
    pathObj: function () {
      const topRow = this.center[1] - this.radius
      const bottomRow = this.center[1] + this.radius

      const leftCol = this.center[0] - this.radius
      const rightCol = this.center[0] + this.radius
      return [{
        type: 'M',
        coords: [
          [this.center[0], this.center[1]-this.radius, 0].map(this.xformCoord)
        ]
      }, {
        type: 'C',
        coords: [
          [this.center[0] + this.hr, topRow , 0].map(this.xformCoord),
          [rightCol, topRow + this.hr, 0].map(this.xformCoord),
          [rightCol, this.center[1], 0].map(this.xformCoord)
        ]
      },{
        type: 'C',
        coords: [
          [rightCol, this.center[1] + this.hr, 0].map(this.xformCoord),
          [this.center[0] + this.hr, bottomRow, 0].map(this.xformCoord),
          [this.center[0], bottomRow, 0].map(this.xformCoord)
        ]
      },{
        type: 'C',
        coords: [
          [this.center[0] - this.hr, bottomRow, 0].map(this.xformCoord),
          [leftCol, this.center[1] + this.hr, 0].map(this.xformCoord),
          [leftCol, this.center[1], 0].map(this.xformCoord)
        ]
      },{
        type: 'C',
        coords: [
          [leftCol, this.center[1] - this.hr, 0].map(this.xformCoord),
          [this.center[0] - this.hr, topRow, 0].map(this.xformCoord),
          [this.center[0], topRow, 0].map(this.xformCoord)
        ]
      },{
        type: 'z',
        coords: [[]]
      }]
    },
    pathD: function () {
      return this.pathObj.map(obj => `${obj.type}${obj.coords.map(c => c.slice(0,2)).join(' ')}`).join('')
    }
  },
}
</script>
<style scoped>
.path
{
  pointer-events: visibleStroke;
}
</style>
