<template>
  <div class="landmark-container">
    <div class="landmark-row">
      <div class="landmark-cell">
        <LandmarkComponent
          :landmark="lm.temporary ? null : lm"
          @mousedownOnIcon="mousedownOnIcon({lmId: lm.id, panelIdx: 0, zOffset: calcZOffset(0, lm)})"
          @mouseenterOnIcon="mouseenterOnIcon({ lmId: lm.id, panelIdx: 0 })"
          @mouseleaveOnIcon="mouseleaveOnIcon({ lmId: lm.id, panelIdx: 0 })"
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
          :landmark="lm.temporary ? null : lm"
          @mousedownOnIcon="mousedownOnIcon({lmId: lm.id, panelIdx: 1, zOffset: calcZOffset(1, lm)})"
          @mouseenterOnIcon="mouseenterOnIcon({ lmId: lm.id, panelIdx: 1 })"
          @mouseleaveOnIcon="mouseleaveOnIcon({ lmId: lm.id, panelIdx: 1 })"
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
          :landmark="lm.temporary ? null : lm"
          @mousedownOnIcon="mousedownOnIcon({lmId: lm.id, panelIdx: 2, zOffset: calcZOffset(2, lm)})"
          @mouseenterOnIcon="mouseenterOnIcon({ lmId: lm.id, panelIdx: 2 })"
          @mouseleaveOnIcon="mouseleaveOnIcon({ lmId: lm.id, panelIdx: 2 })"
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
      </div>
    </div>
  </div>
</template>
<script>
import LandmarkComponent from '@/components/LandmarkUnit'
import { LANDMARK_ICON_THRESHOLD } from '@/constants'

export default {
  props: {
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
      draggedPanelIdx: null
    }
  },
  watch: {
  },
  computed: {
  },
  methods: {
    mouseenterOnIcon: function ({ lmId, panelIdx }) {
      this.$emit('mouseenterOnIcon', {lmId, panelIdx})
    },
    mouseleaveOnIcon: function ({ lmId, panelIdx }) {
      this.$emit('mouseleaveOnIcon', {lmId, panelIdx})
    },
    mousedownOnIcon: function ({lmId, panelIdx, zOffset}) {
      if (Math.abs(zOffset) > LANDMARK_ICON_THRESHOLD) {
        /**
         * landmark out of plane, teleport to this location
         */
        this.$emit('gotoLm', { lmId, zOffset })
      } else {
        this.$emit('mousedownOnIcon', {lmId, panelIdx})
      }
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

</style>
