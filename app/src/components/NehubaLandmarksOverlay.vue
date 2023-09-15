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
import { LANDMARK_ICON_THRESHOLD, determineElement } from '@/constants'

export default {
  props: {
    layout: {
      type: '2x2' | 'slice' | 'perspective',
      default: '2x2'
    },
    viewportElements: {
      type: Set,
      default: function () {
        return new Set()
      }
    },
    dataToViewportWeakMap: {
      type: WeakMap,
      default: function () {
        return new WeakMap()
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
      idxToHtmlElementMap: null,
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
    assignViewPort: function () {
      
      const {
        viewportElements: viewportElementsSet,
        idxToHtmlElementMap,
      } = this

      const assignKeys = () => {
        this.idxToHtmlElementMap = null

        const cache = new Map()
        const cacheSet = new Set()
        const elements = Array.from(viewportElementsSet)
        for (const element of elements) {
          const idx = determineElement(element)
          if (idx !== null) {
            cache.set(idx, element)
            cacheSet.add(element)
          }
        }
        if (cache.size !== 3) {
          console.warn(`nehubalandmarksoverlay, cache size !== 3, but equal to: ${cache.size}. Aborting ...`)
          return
        }
        this.idxToHtmlElementMap = cache
      }

      // testing assignment
      if (!idxToHtmlElementMap) return assignKeys()
      for (const key of idxToHtmlElementMap.values()) {
        if (!viewportElementsSet.has(key)) {
          assignKeys()
          break
        }
      }
    },
    calcZOffset: function (idx, lm) {
      this.assignViewPort()
      const {
        dataToViewportWeakMap,
        idxToHtmlElementMap,
      } = this
      if (!idxToHtmlElementMap) return 0

      const fn = dataToViewportWeakMap.get(
        idxToHtmlElementMap.get(idx)
      )
      
      const val = fn(lm.coord)
      return val[2]
    },
    calcTransformStyle: function (idx, lm) {
      this.assignViewPort()
      const {
        dataToViewportWeakMap,
        idxToHtmlElementMap,
      } = this
      if (!idxToHtmlElementMap) return {}

      const fn = dataToViewportWeakMap.get(
        idxToHtmlElementMap.get(idx)
      )

      const val = fn(lm.coord)
      return {
        transform: `translate(${val[0]}px, ${val[1]}px)`
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
