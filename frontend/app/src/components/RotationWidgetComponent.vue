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
      
    <path
      @mousedown="mousedown(1)"
      :stroke-width="svgStrokeWidth"
      pointer-events="visibleStroke"
      class="svg-path"
      :style="getStyle(1)"
      :stroke="getColorFromIdx(1)"
      :fill="svgFill(1)"
      :d="svgD1">
    </path>
    <path
      id="svg-2"
      @mousedown="mousedown(2)"
      :stroke-width="svgStrokeWidth"
      pointer-events="visibleStroke"
      class="svg-path"
      :style="getStyle(2)"
      :stroke="getColorFromIdx(2)"
      :fill="svgFill(2)"
      :d="svgD2">
    </path>
    <path
      id="svg-3"
      @mousedown="mousedown(3)"
      :stroke-width="svgStrokeWidth"
      pointer-events="visibleStroke"
      class="svg-path"
      :style="getStyle(3)"
      :stroke="getColorFromIdx(3)"
      :fill="svgFill(3)"
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
export default {
  props: {
    rotationQuat: {
      type: Array,
      default: [0, 0, 0, 1]
    }
  },
  data: function () {
    return {
      mousePos: null,
      focusIdx: null
    }
  },
  computed: {
    clipPathD: function () {
      return this.focusIdx === 1
        ? this.svgD1
        : this.focusIdx === 2
          ? this.svgD2
          : this.focusIdx === 3
            ? this.svgD3
            : null
    },
    svgD1: function () {
      return this.getCircle({index: 1, rot: this.rotationQuat})
    },
    svgD2: function () {
      return this.getCircle({index: 2, rot: this.rotationQuat})
    },
    svgD3: function () {
      return this.getCircle({index: 3, rot: this.rotationQuat})
    },
    svgStrokeWidth: function () {
      return 10
    },

    guidingLineD: function () {
      if (!this.mousePos)
        return null
      const l = this.mousePos.reduce((acc, item) => acc + item ** 2, 0) ** 0.5
      return `M60 60 l ${this.mousePos.map(v => v / l * 50).join(' ')}`
    },
  },
  methods: {
    getStyle: function (index) {
      return this.focusIdx === null
        ? { opacity: 0.5 }
        : this.focusIdx === index
          ? { opacity: 0.9 }
          : { opacity: 0.2 }
    },
    /**
     * negative radius should give circle in the opposite direction
     * maybe should be a xform matrix instead? allow for perspective xform
     */
    getCircle: function ({center = [60, 60], radius = 50, index = 1, rot = [0, 0, 0, 1]}) {
      const hr = radius / 2
      return `M ${center.join(' ')},
        m ${this.xformCoord({ index, coord: [0, radius * -1], rot }).join(' ')},
        c ${this.xformCoord({ index, coord: [hr, 0], rot }).join(' ')}, ${this.xformCoord({ index, coord: [radius, hr], rot }).join(' ')}, ${this.xformCoord({ index, coord: [radius, radius], rot }).join(' ')}
        c ${this.xformCoord({ index, coord: [0, hr], rot }).join(' ')}, ${this.xformCoord({ index, coord: [hr * -1, radius], rot}).join(' ')}, ${this.xformCoord({ index, coord: [radius* -1, radius], rot}).join(' ')}
        c ${this.xformCoord({ index, coord: [hr * -1, 0], rot}).join(' ')}, ${this.xformCoord({ index, coord: [radius * -1, hr * -1], rot}).join(' ')}, ${this.xformCoord({ index, coord: [radius * -1, radius * -1], rot}).join(' ')}
        c ${this.xformCoord({ index, coord: [0, hr * -1], rot}).join(' ')}, ${this.xformCoord({ index, coord: [hr, radius * -1], rot}).join(' ')}, ${this.xformCoord({ index, coord: [radius, radius * -1], rot}).join(' ')} z`
    },
    xformCoord: function ({coord, index, rot}) {
      if (!rot)
        return coord
      
      const { mat4, quat, vec3 } = window.export_nehuba
      const q = quat.fromValues(...rot)
      quat.invert(q, q)
      
      const actualCoord = this.shuffle([...coord, 0], index)
      const newV = vec3.fromValues(...actualCoord)
      vec3.transformQuat(newV, newV, q)
      return Array.from(newV).slice(0, 2)
    },
    getColorFromIdx: function (idx) {
      return idx === 1
        ? 'red'
        : idx === 2
          ? 'green'
          : idx === 3
            ? 'blue'
            : 'black'

    },
    svgFill: function (idx) {
      return idx === this.focusIdx
        ? `${this.getColorFromIdx(idx)}`
        : 'none'
    },
    shuffle: function (coord, idx) {
      if (idx === 1) {
        return coord
      }
      if (idx ===2) {
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
        name: 'rotate by RGB widget',
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
  },
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
