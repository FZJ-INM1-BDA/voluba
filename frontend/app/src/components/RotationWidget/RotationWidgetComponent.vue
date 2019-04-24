<template>
  <svg
    ref="svgContainer"
    class="svg"
    viewBox="0 0 120 120"
    xmlns="http://www.w3.org/2000/svg">
    <clipPath
      id="clipPathId">

      <path
        fill="none"
        class="svg-path"
        :d="clipPathD">
      </path>
    </clipPath>

    <defs>
      <LinearGradientSvgFrag
        color="red"
        :x1="gradientRed[0][0] / 120"
        :y1="gradientRed[0][1] / 120"
        :x2="gradientRed[1][0] / 120"
        :y2="gradientRed[1][1] / 120"
        id="svg-lg-red"/>

      <LinearGradientSvgFrag
        color="green"
        :x1="gradientGreen[0][0] / 120"
        :y1="gradientGreen[0][1] / 120"
        :x2="gradientGreen[1][0] / 120"
        :y2="gradientGreen[1][1] / 120"
        id="svg-lg-green"/>

      <LinearGradientSvgFrag
        color="blue"
        :x1="gradientBlue[0][0] / 120"
        :y1="gradientBlue[0][1] / 120"
        :x2="gradientBlue[1][0] / 120"
        :y2="gradientBlue[1][1] / 120"
        id="svg-lg-blue"/>

    </defs>
      
    <path
      @mousedown="mousedown(3)"
      :stroke-width="svgStrokeWidth"
      pointer-events="visibleStroke"
      class="svg-path"
      :style="getStyle(3)"
      stroke="url('#svg-lg-red')"
      :fill="svgFill(3)"
      :d="svgD1">
    </path>
    <path
      
      id="svg-2"
      @mousedown="mousedown(2)"
      :stroke-width="svgStrokeWidth"
      pointer-events="visibleStroke"
      class="svg-path"
      :style="getStyle(2)"
      stroke="url('#svg-lg-green')"
      :fill="svgFill(2)"
      :d="svgD2">
    </path>
    <path
      id="svg-3"
      @mousedown="mousedown(1)"
      :stroke-width="svgStrokeWidth"
      pointer-events="visibleStroke"
      class="svg-path"
      :style="getStyle(1)"
      stroke="url('#svg-lg-blue')"
      :fill="svgFill(1)"
      :d="svgD3">
    </path>

    <path
      v-if="focusIdx"
      clip-path="url(#clipPathId)"
      stroke-width="7"
      stroke="white"
      :d="guidingLineD">
    </path>

  </svg>
</template>
<script>

import LinearGradientSvgFrag from './LinearGradientSvgFrag'
import { mapState } from 'vuex'

export default {
  components: {
    LinearGradientSvgFrag
  },
  props: {
    rotationQuat: {
      type: Array,
      default: [0, 0, 0, 1]
    },
    width: {
      type: Number,
      default: 120
    },
    margin: {
      type: Number,
      default: 0.1
    }
  },
  data: function () {
    return {
      mousePos: null,
      focusIdx: null
    }
  },
  computed: {
    ...mapState({
      appendNehubaFlag: 'appendNehubaFlag'
    }),
    gradientRed: function () {
      const arr = this.circleRed.path
        .map(p => p.coords)
        .flatMap(coords => coords)
        .filter(coords => coords.length > 0)
      const idx = arr.map((coord, idx) => ({idx, z: coord[2]})).sort((a, b) => a.z - b.z)[0].idx
      return [arr[idx], arr[(idx + 7) % arr.length]]
    },
    gradientBlue: function () {
      const arr = this.circleBlue.path
        .map(p => p.coords)
        .flatMap(coords => coords)
        .filter(coords => coords.length > 0)
      const idx = arr.map((coord, idx) => ({idx, z: coord[2]})).sort((a, b) => a.z - b.z)[0].idx
      return [arr[idx], arr[(idx + 7) % arr.length]]
    },
    gradientGreen: function () {
      const arr = this.circleGreen.path
        .map(p => p.coords)
        .flatMap(coords => coords)
        .filter(coords => coords.length > 0)
      const idx = arr.map((coord, idx) => ({idx, z: coord[2]})).sort((a, b) => a.z - b.z)[0].idx
      return [arr[idx], arr[(idx + 7) % arr.length]]
    },
    rot: function () {
      return this.rotationQuat || [0, 0, 0, 1]
    },
    radius: function () {
      return (1 - this.margin) * this.width/2
    },
    halfRadius: function () {
      return this.radius / 2
    },
    center: function () {
      return [this.width/2, this.width/2]
    },
    clipPathD: function () {
      return this.focusIdx === 3
        ? this.svgD1
        : this.focusIdx === 2
          ? this.svgD2
          : this.focusIdx === 1
            ? this.svgD3
            : null 
    },
    circleRed: function () {
      return this.getCircle(3)
    },
    circleBlue: function () {
      return this.getCircle(1)
    },
    circleGreen: function () {
      return this.getCircle(2)
    },
    svgD1: function () {
      return this.getCircleFromData(this.circleRed)
    },
    svgD2: function () {
      return this.getCircleFromData(this.circleGreen)
    },
    svgD3: function () {
      return this.getCircleFromData(this.circleBlue)
    },
    svgStrokeWidth: function () {
      return 10
    },

    guidingLineD: function () {
      if (!this.mousePos)
        return null
      return `M60 60 l ${this.mousePos.map(v => v * 100).join(' ')}`
    },
  },
  methods: {
    getCircle: function (idx) {

      const topRow = this.center[1] - this.radius
      const bottomRow = this.center[1] + this.radius

      const leftCol = this.center[0] - this.radius
      const rightCol = this.center[0] + this.radius
      return {
        path: [{
          type: 'M',
          coords: [[this.center[0], topRow, 0]].map(this.getApplyXform(idx))
        },{
          type: 'C',
          coords: [
            [this.center[0] + this.halfRadius, topRow , 0],
            [rightCol, topRow + this.halfRadius, 0],
            [rightCol, this.center[1], 0]
          ].map(this.getApplyXform(idx))
        },{
          type: 'C',
          coords: [
            [rightCol, this.center[1] + this.halfRadius, 0],
            [this.center[0] + this.halfRadius, bottomRow, 0],
            [this.center[0], bottomRow, 0]
          ].map(this.getApplyXform(idx))
        },{
          type: 'C',
          coords: [
            [this.center[0] - this.halfRadius, bottomRow, 0],
            [leftCol, this.center[1] + this.halfRadius, 0],
            [leftCol, this.center[1], 0]
          ].map(this.getApplyXform(idx))
        },{
          type: 'C',
          coords: [
            [leftCol, this.center[1] - this.halfRadius, 0],
            [this.center[0] - this.halfRadius, topRow, 0],
            [this.center[0], topRow, 0]
          ].map(this.getApplyXform(idx))
        },{
          type: 'z',
          coords: [[]]
        }]
      }
    },
    getStyle: function (index) {
      return this.focusIdx === null
        ? { opacity: 0.5 }
        : this.focusIdx === index
          ? { opacity: 0.9 }
          : { opacity: 0.2 }
    },
    xformCoordFull: function ({ coord, index }) {
      if (! this.appendNehubaFlag )
        return coord
      
      const { mat4, quat, vec3 } = window.export_nehuba
      const q = quat.fromValues(...this.rot)
      quat.invert(q, q)
      
      const actualCoord = this.shuffle(coord.map((v, idx) => idx < 2 ? v - this.center[idx] : v), index)
      const newV = vec3.fromValues(...actualCoord)
      const disp = vec3.fromValues(...this.center, 0)
      vec3.transformQuat(newV, newV, q)
      vec3.add(newV, newV, disp)
      return Array.from(newV)
    },
    getColorFromIdx: function (idx) {
      return idx === 1
        ? 'blue'
        : idx === 2
          ? 'green'
          : idx === 3
            ? 'red'
            : 'black'

    },
    svgFill: function (idx) {
      return idx === this.focusIdx
        ? `${this.getColorFromIdx(idx)}`
        : 'none'
    },
    getApplyXform: function (index) {
      return coord => this.xformCoordFull({ coord, index })
    },
    getCircleFromData: function (data) {
      return data.path.map(pathObj => `${pathObj.type}${pathObj.coords.map(coord => coord.slice(0, 2)).join(' ')}`)
    },
    shuffle: function (coord, idx) {
      if (idx === 1) {
        return coord
      }
      if (idx === 2) {
        return coord.slice(0,1).concat(coord.slice(1).reverse())
      }
      if (idx === 3) {
        return coord.slice(2).concat(coord.slice(0, 2))
      }
    },
    mousedown: function (idx) {
      this.focusIdx = idx
      document.addEventListener('mousemove', this.mousemove, {capture: true})
      document.addEventListener('mouseup', this.mouseup, {capture: true, once: true})
    },
    mousemove: function (event) {

      /**
       * TODO no better way than getBoundingClientRect?
       */
      const {left, top} = this.$refs.svgContainer.getBoundingClientRect()
      /**
       * calculate from center of the canvas
       */
      const newMousePos = [event.clientX - left - 30, event.clientY - top - 30]
      
      if (!this.mousePos) {
        this.mousePos = newMousePos
        return
      }
      const rot = (Math.atan2(...newMousePos) -  Math.atan2( ...this.mousePos )) * 180 / Math.PI
      this.mousePos = newMousePos
      
      const { quat } = window.export_nehuba
      const sum = (event.movementX + event.movementY) * this.movementMultiplier
      /**
       * rotation widget is still a bit wonky. if one change perspect 180deg, the rotation is exactly reversed
       */
      const q = quat.fromEuler(
        quat.create(),
        this.focusIdx === 3 ? rot : 0,
        this.focusIdx === 2 ? rot : 0,
        this.focusIdx === 1 ? rot : 0
      )
      this.$store.dispatch('pushUndo', {
        name: `rotate by RGB widget ${this.focusIdx}`,
        collapse: `rotate by rgb widget ${this.focusIdx}`
      })
      this.$store.dispatch('rotIncBy', {
        quaternion: Array.from(q)
      })
    },
    mouseup: function () {
      this.focusIdx = null
      this.mousePos = null
      document.removeEventListener('mousemove', this.mousemove, {capture: true})
    },
  }
}
</script>
<style scoped>
.svg
{
  width: 3em;
  height: 3em;
}

.svg-path
{
  transition: opacity linear 200ms;
  pointer-events:auto;
}

.svg-path:hover
{
  opacity: 1.0!important;
}
</style>
