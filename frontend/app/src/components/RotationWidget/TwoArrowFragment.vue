<template>
  <g
    class="group"
    @mouseenter="$emit('mouseenterPath')"
    @mouseleave="$emit('mouseleavePath')"
    @mousedown="$emit('mousedownPath')">
    <path
      :d="pathD1"
      class="path thin">
    </path>
    <path
      :d="pathD2"
      class="path">
    </path>
    <path
      :d="pathD3"
      class="path thin">
    </path>

    <path
      :d="pathD1x"
      class="path thin">
    </path>

    <path
      :d="pathD3x"
      class="path thin">
    </path>
  </g>
</template>
<script>

const ObjToD = obj => `${obj.type}${obj.coords.map(c => c.slice(0,2)).join(' ')}`

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
    }
  },
  computed: {
    radius: function(){
      return this.width / 2
    },
    hr: function () {
      return this.width / 4
    },
    pathD1: function () {
      return this.pathObj1.map(ObjToD)
    },
    pathD2: function () {
      return this.pathObj2.map(ObjToD)
    },
    pathD3: function () {
      return this.pathObj3.map(ObjToD)
    },
    pathD1x: function () {
      return this.pathObj1x.map(ObjToD)
    },
    pathD3x: function () {
      return this.pathObj3x.map(ObjToD)
    },
    pathObj1: function () {
      return [{
        type: 'M',
        coords: [
          [this.center[0] - this.hr, this.center[1] - this.hr, 0 ]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0], this.center[1] - this.radius, 0]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0] + this.hr, this.center[1] - this.hr, 0]
        ].map(this.xformCoord)
      }, {
        type: 'z',
        coords: [[]]
      }]
    },
    pathObj2: function () {
      return [{
        type: 'M',
        coords: [
          [this.center[0], this.center[1] - this.radius, 0]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0], this.center[1] + this.radius, 0]
        ].map(this.xformCoord)
      }]
    },
    pathObj3: function () {
      return [{
        type: 'M',
        coords: [
          [this.center[0] - this.hr, this.center[1] + this.hr, 0 ]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0], this.center[1] + this.radius, 0]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0] + this.hr, this.center[1] + this.hr, 0]
        ].map(this.xformCoord)
      }, {
        type: 'z',
        coords: [[]]
      }]
    },
    pathObj1x: function () {
      return [{
        type: 'M',
        coords: [
          [this.center[0], this.center[1] - this.hr, - this.hr ]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0], this.center[1] - this.radius, 0]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0], this.center[1] - this.hr, this.hr]
        ].map(this.xformCoord)
      }, {
        type: 'z',
        coords: [[]]
      }]
    },
    pathObj3x: function () {
      return [{
        type: 'M',
        coords: [
          [this.center[0], this.center[1] + this.hr, -this.hr ]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0], this.center[1] + this.radius, 0]
        ].map(this.xformCoord)
      }, {
        type: 'L',
        coords: [
          [this.center[0], this.center[1] + this.hr, this.hr]
        ].map(this.xformCoord)
      }, {
        type: 'z',
        coords: [[]]
      }]
    },
  },
}
</script>
<style scoped>
.path
{
  pointer-events: visibleStroke;
  fill: none;
  stroke: blue;
}

.path:not(.thin)
{
  stroke-width: 5;
}

.path.thin
{
  stroke-width: 2;
}

.group
{
  opacity: 0.8;
}
.group:hover
{
  opacity: 1.0;
}
</style>
