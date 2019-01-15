<template>
  <div class="landmark-container">
    <div class="landmark-row">
      <div class="landmark-cell">
        <!-- <div v-for = "lm in landmarks" :key = "lm.id">
          {{ calcTransformStyle(0, lm) | stringify }}
        </div> -->
        <LandmarkComponent
          class = "landmark-unit"
          :style = "calcTransformStyle(0, lm)"
          v-for = "lm in landmarks"
          :key = "lm.id"
          />
      </div>
      <div class="landmark-cell">
        <LandmarkComponent
          class = "landmark-unit"
          :style = "calcTransformStyle(1, lm)"
          v-for = "lm in landmarks"
          :key = "lm.id"
          />
      </div>
    </div>
    <div class="landmark-row">
      <div class="landmark-cell">
        <LandmarkComponent
          class = "landmark-unit"
          :style = "calcTransformStyle(2, lm)"
          v-for = "lm in landmarks"
          :key = "lm.id"
          />
      </div>
      <div class="landmark-cell">
        <!-- should be nothing here -->
      </div>
    </div>
  </div>
</template>
<script>
import LandmarkComponent from '@/components/LandmarkUnit'

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
  watch: {
  },
  computed: {
  },
  methods: {
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
  mounted() {
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
  pointer-events: all;
  position: absolute;
}

</style>
