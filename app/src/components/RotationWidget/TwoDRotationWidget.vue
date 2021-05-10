<template>
  <div>
    <svg
      viewBox="0 0 40 40"
      ref="svg"
      class="pe-none svg-container">
      
      <clipPath id="clipPathId">
        <path
          fill="none"
          :d="pathD">
        </path>
      </clipPath>

      <CircleFragment
        ref="circleFragment"
        @mouseenterPath="mouseenterPath"
        @mouseleavePath="mouseleavePath"
        @mousedownPath="mousedownPath"
        :pathStyle="cricleStyle"
        :center="center"
        :width="width" />

      <path
        v-if="mousedown"
        clip-path="url(#clipPathId)"
        stroke-width="2"
        stroke="white"
        :d="guidingLineD">
      </path>

      <!-- twoarrwo fragment is not very stable at the moment -->
      <!-- responsive direction is a bit bugged -->
      <!-- reenable once fixed -->

      <!-- <g class="flip1">
        <TwoArrowFragment
          @click.native="$emit('clickTwoArrow', { idx: 1 })"
          :xformCoord="xform1"
          :center="[0, 0]"
          :fillColor="[0, 200, 0]"
          :width="width"/>
      </g>
      <g class="flip2">
        <TwoArrowFragment
          @click.native="$emit('clickTwoArrow', { idx: 0 })"
          :xformCoord="xform2"
          :center="[0, 0]"
          :fillColor="[200, 0, 0]"
          :width="width"/>
      </g>
      <g class="flip3">
        <TwoArrowFragment
          @click.native="$emit('clickTwoArrow', { idx: 2 })"
          :xformCoord="xform3"
          :center="[0, 0]"
          :fillColor="[0, 0, 200]"
          :width="width"/>
      </g> -->
    </svg>
    <b-button class="pe-all" pill size="sm" variant="success"
      @click="$emit('clickTwoArrow', { idx: 1 })">
      <font-awesome-icon icon="arrows-alt-h" />
    </b-button>
    <b-button class="pe-all" pill size="sm" variant="danger"
      @click="$emit('clickTwoArrow', { idx: 0 })">
      <font-awesome-icon icon="arrows-alt-h" />
    </b-button>
    <b-button class="pe-all" pill size="sm" variant="primary"
      @click="$emit('clickTwoArrow', { idx: 2 })">
      <font-awesome-icon icon="arrows-alt-h" />
    </b-button>
  </div>
</template>
<script>
import CircleFragment from '@/components/RotationWidget/CircleFragment'
import TwoArrowFragment from '@/components/RotationWidget/TwoArrowFragment'

const hoverStyle = {
  fill: 'none',
  stroke: 'blue',
  'stroke-width': 5
}

const restStyle = {
  ...hoverStyle,
  opacity: 0.8
}

const fill = {
  fill: 'blue'
}

const shuffle = (idx) => coord => idx === 2
  ? coord.slice(1).concat(coord.slice(0,1))
  : idx === 3
    ? coord.slice(2).concat(coord.slice(0, 2))
    : coord

const shuffle1 = shuffle(1)
const shuffle2 = shuffle(2)
const shuffle3 = shuffle(3)

const getXformedCoord = ({ shuffle, rot }) => !('export_nehuba' in window)
  ? coord => coord
  : coord => {
    const { vec3 } = window.export_nehuba

    const shuffled = shuffle(coord)
    const coordVec3 = vec3.fromValues(...shuffled)
    vec3.transformQuat(coordVec3,coordVec3, rot)
    return Array.from(coordVec3)
  }

export default {
  components: {
    CircleFragment,
    TwoArrowFragment
  },
  props: {
    restStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    hoverStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    mousedownStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    rotationQuaternion: {
      type: Array,
      default: () => [0, 0, 0, 1]
    }
  },
  data: function () {
    return {
      onHover: false,
      mousedown: false,
      center: [20,20],
      width: 18,
      mousePos: null,
      pathD: null
    }
  },
  methods: {
    mouseenterPath: function (event){
      this.onHover = true
    },
    mouseleavePath: function (event){
      this.onHover = false
    },
    mousedownPath: function (event){
      this.mousedown = true

      document.addEventListener('mousemove', this.documentMousemoveListener)
    },
    documentMouseupListener: function () {
      this.mousedown = false

      this.mousePos = null
      document.removeEventListener('mousemove', this.documentMousemoveListener)
    },
    documentMousemoveListener: function (event) {
      
      /**
       * TODO no better way than getBoundingClientRect?
       */
      const {left, top} = this.$refs.svg.getBoundingClientRect()
      /**
       * calculate from center of the canvas
       */
      const newMousePos = [event.clientX - left - this.center[0], event.clientY - top - this.center[1]]
      
      if (!this.mousePos) {
        this.mousePos = newMousePos
        return
      }
      const rot = (Math.atan2(...newMousePos) -  Math.atan2( ...this.mousePos )) * 180 / Math.PI
      this.mousePos = newMousePos

      this.$emit('rotateCircle', { rot })
    }
  },
  mounted() {
    this.pathD = (this.$refs.circleFragment && this.$refs.circleFragment.pathD) || ''
    document.addEventListener('mouseup', this.documentMouseupListener)
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.documentMouseupListener)
  },
  computed: {
    xform1: function () {
      if (!('export_nehuba' in window)) {
        return coord => coord
      }

      const { quat, vec3 } = window.export_nehuba
      const rot = quat.fromValues(...this.rotationQuaternion)

      return coord => getXformedCoord({ shuffle: shuffle1, rot })(coord)
    },
    xform2: function () {
      if (!('export_nehuba' in window)) {
        return coord => coord
      }
      const { quat, vec3 } = window.export_nehuba
      const rot = quat.fromValues(...this.rotationQuaternion)
      return coord => getXformedCoord({ shuffle: shuffle2, rot })(coord)
    },
    xform3: function () {
      if (!('export_nehuba' in window)) {
        return coord => coord
      }

      const { quat, vec3 } = window.export_nehuba
      const rot = quat.fromValues(...this.rotationQuaternion)

      return coord => getXformedCoord({ shuffle: shuffle3, rot })(coord)
    },
    guidingLineD: function () {
      if (!this.mousePos)
        return null
      return `M${this.center.join(' ')} l ${this.mousePos.map(v => v * 100).join(' ')}`
    },
    cricleStyle: function () {
      return {
        ...this.onHover
          ? {
            ...hoverStyle,
            ...this.hoverStyle
          }
          : { 
            ...restStyle,
            ...this.restStyle
          },
        ...this.mousedown
          ? {
            ...fill,
            ...this.mousedownStyle
          }
          : {}
      }
    }
  },
}
</script>
<style scoped>
.svg-container
{
  width: 5em;
  height: auto;
}
.flip1
{
  transform: translate(30%, 20px)
}
.flip2
{
  transform: translate(50%, 20px)
}
.flip3
{
  transform: translate(70%, 20px)
}
</style>
