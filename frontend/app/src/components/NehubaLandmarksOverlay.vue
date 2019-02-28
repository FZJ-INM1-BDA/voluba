<template>
  <div class="landmark-container">
    <div class="landmark-row">
      <div class="landmark-cell">
        <LandmarkComponent
          @mousedownOnIcon="mousedownOnIcon({lmId: lm.id, panelIdx: 0})"
          v-for="lm in landmarks"
          class="landmark-unit"
          :active="lm.active"
          :tooltipText="lm.temporary ? null : lm.name"
          :color="lm.color"
          :zOffset="calcZOffset(0, lm)"
          :style="calcTransformStyle(0, lm)"
          :key="lm.id"
          />
      </div>
      <div class="landmark-cell">
        <LandmarkComponent
          @mousedownOnIcon="mousedownOnIcon({lmId: lm.id, panelIdx: 1})"
          :zOffset="calcZOffset(1, lm)"
          class="landmark-unit"
          :active="lm.active"
          :tooltipText="lm.temporary ? null : lm.name"
          :color="lm.color"
          :style="calcTransformStyle(1, lm)"
          v-for="lm in landmarks"
          :key="lm.id"
          />
      </div>
    </div>
    <div class="landmark-row">
      <div class="landmark-cell">
        <LandmarkComponent
          @mousedownOnIcon="mousedownOnIcon({lmId: lm.id, panelIdx: 2})"
          :zOffset="calcZOffset(2, lm)"
          :active="lm.active"
          :tooltipText="lm.temporary ? null : lm.name"
          :color="lm.color"
          class="landmark-unit"
          :style="calcTransformStyle(2, lm)"
          v-for="lm in landmarks"
          :key="lm.id"
          />
      </div>
      <div class="landmark-cell">
        <div v-if="perspectiveOrientation" class="perspective-controller">
          
          <svg class="svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <path
              @mousedown="mousedown(1)"
              :stroke-width="svgStrokeWidth"
              pointer-events="visibleStroke"
              class="svg-path"
              :stroke="getColorFromIdx(1)"
              :fill="svgFill(1)"
              :d="svgD1">
            </path>
            <path
              @mousedown="mousedown(2)"
              :stroke-width="svgStrokeWidth"
              pointer-events="visibleStroke"
              class="svg-path"
              :stroke="getColorFromIdx(2)"
              :fill="svgFill(2)"
              :d="svgD2">
            </path>
            <path
              @mousedown="mousedown(3)"
              :stroke-width="svgStrokeWidth"
              pointer-events="visibleStroke"
              class="svg-path"
              :stroke="getColorFromIdx(3)"
              :fill="svgFill(3)"
              :d="svgD3">
            </path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import LandmarkComponent from '@/components/LandmarkUnit'

export default {
  props: {
    perspectiveOrientation: {
      type: Array,
      default: null
    },
    layout: {
      type: '2x2' | 'slice' | 'perspective',
      default: '2x2'
    },
    dataToViewport: {
      type: Array,
      default: function () {
        return []
      }
    },
    landmarks: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      draggedLmId: null,
      draggedPanelIdx: null,
      focusIdx: null,
      movementMultiplier: 5
    }
  },
  watch: {
  },
  computed: {
    svgStrokeWidth: function () {
      return 8
    },
    svgD1: function () {
      return `M60 60,
        m ${this.getDelta(this.shuffle([-50, 0, 0], 1)).join(' ')},
        c ${this.curveTL(1)} ${this.getDelta(this.shuffle([50, -50, 0], 1)).join(' ')} 
        c ${this.curveTR(1)} ${this.getDelta(this.shuffle([50, 50, 0], 1)).join(' ')}
        c ${this.curveBR(1)} ${this.getDelta(this.shuffle([-50, 50, 0], 1)).join(' ')}
        c ${this.curveBL(1)} ${this.getDelta(this.shuffle([-50, -50, 0], 1)).join(' ')}`
    },
    svgD2: function () {
      return `M60 60,
        m ${this.getDelta(this.shuffle([-50, 0, 0], 2)).join(' ')},
        c ${this.curveTL(2)} ${this.getDelta(this.shuffle([50, -50, 0], 2)).join(' ')} 
        c ${this.curveTR(2)} ${this.getDelta(this.shuffle([50, 50, 0], 2)).join(' ')}
        c ${this.curveBR(2)} ${this.getDelta(this.shuffle([-50, 50, 0], 2)).join(' ')}
        c ${this.curveBL(2)} ${this.getDelta(this.shuffle([-50, -50, 0], 2)).join(' ')}`
    },
    svgD3: function () {
      return `M60 60,
        m ${this.getDelta(this.shuffle([-50, 0, 0], 3)).join(' ')},
        c ${this.curveTL(3)} ${this.getDelta(this.shuffle([50, -50, 0], 3)).join(' ')} 
        c ${this.curveTR(3)} ${this.getDelta(this.shuffle([50, 50, 0], 3)).join(' ')}
        c ${this.curveBR(3)} ${this.getDelta(this.shuffle([-50, 50, 0], 3)).join(' ')}
        c ${this.curveBL(3)} ${this.getDelta(this.shuffle([-50, -50, 0], 3)).join(' ')}`
    },
  },
  methods: {
    mousedown: function (idx) {
      this.focusIdx = idx
      document.addEventListener('mousemove', this.mousemove, {capture: true})
      document.addEventListener('mouseup', this.mouseup, {capture: true, once: true})
    },
    mousemove: function (event) {
      const { quat } = window.export_nehuba
      const sum = (event.movementX + event.movementY) * this.movementMultiplier
      const q = quat.fromEuler(
        quat.create(),
        this.focusIdx === 3 ? sum : 0,
        this.focusIdx === 2 ? sum : 0,
        this.focusIdx === 1 ? sum : 0
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
      document.removeEventListener('mousemove', this.mousemove, {capture: true})
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
    curveTL: function (idx) {
      return `${this.getDelta(this.shuffle([0, -25, 0], idx)).join(' ')}, ${this.getDelta(this.shuffle([25, -50, 0], idx)).join(' ')},`
    },
    curveTR: function (idx) {
      return `${this.getDelta(this.shuffle([25, 0, 0], idx)).join(' ')}, ${this.getDelta(this.shuffle([50, 25, 0], idx)).join(' ')},`
    },
    curveBR: function (idx) {
      return `${this.getDelta(this.shuffle([0, 25, 0], idx)).join(' ')}, ${this.getDelta(this.shuffle([-25, 50, 0], idx)).join(' ')},`
    },
    curveBL: function (idx) {
      return `${this.getDelta(this.shuffle([-25, 0, 0], idx)).join(' ')}, ${this.getDelta(this.shuffle([-50, -25, 0], idx)).join(' ')},`
    },
    getDelta: function (coord) {
      if (!this.perspectiveOrientation)
        return coord
      const { quat, vec3 } = window.export_nehuba
      const q = quat.fromValues(...this.perspectiveOrientation)
      quat.invert(q, q)

      const newV = vec3.transformQuat(vec3.create(), vec3.fromValues(...coord), q)
      return Array.from(newV).slice(0, 2)
    },
    mousedownOnIcon: function ({lmId, panelIdx}) {
      this.$emit('mousedownOnIcon', {lmId, panelIdx})
    },
    calcZOffset: function (idx, lm) {
      return this.dataToViewport[idx](lm.coord.map(v => v * 1e6))[2]
    },
    calcTransformStyle: function (idx, lm) {
      if (this.dataToViewport[idx]) {
        /**
         * data provided is in mm, data needed is in nm
         */
        const translated = this.dataToViewport[idx](lm.coord.map(v => v * 1e6))
        return {
          transform: `translate(${translated[0]}px, ${translated[1]}px)`
        }
      } else {
        return {

        }
      }
    }
  },
  mounted () {
  },
  components: {
    LandmarkComponent
  },
  filters: {
    stringify: function (obj) {
      return JSON.stringify(obj, null, 2)
    }
  }
}
</script>
<style scoped>
.landmark-container
{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.landmark-row
{
  flex: 1 1 0px;
  display: flex;
  flex-direction: row;
  pointer-events: none;
}

.landmark-cell
{
  border: 1px solid rgba(128, 128, 128, 0.2);
  flex: 1 1 0px;
  position: relative;
  pointer-events: none;
  overflow: hidden;
}

.landmark-unit
{
  pointer-events: none;
  position: absolute;
}

.perspective-controller
{
  position: absolute;
  left: 0;
  bottom: 0;
  margin: 0.5em;
}
.svg
{
  width: 3em;
  height: 3em;
}

.svg-path
{
  opacity: 0.5;
  pointer-events:auto;
}

.svg-path:hover
{
  opacity: 1.0;
}
</style>
