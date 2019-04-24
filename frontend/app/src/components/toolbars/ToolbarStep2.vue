<template>
  <div id="flexcontainer">
    
    <div class="pointer-events flex-items">
      <div
        v-b-tooltip.hover.right="modeBtnTooltipText"
        @click="toggleMode"
        :class="modeBtnClass"
        class="addBtn rounded-circle btn btn-sm">
        <font-awesome-icon icon="columns"></font-awesome-icon>
      </div>
    </div>

    <!-- layer control -->
    <LayerControl class="flex-items pointer-events" />

    <!-- landmark-control -->
    <landmark-control
      :initOpen="false"
      @showLandmarksControl="showLandmarksControl = $event"
      class="pointer-events flex-items" />

    <!-- add btn -->
    <div
      class="flex-items">
      <div
        v-if="!showLandmarksControl"
        @click="$store.dispatch(mode === 'overlay' ? 'addLandmark' : 'addLandmarkPair')"
        class="addBtn point-events rounded-circle btn btn-sm btn-success"
        v-b-tooltip.right.hover
        title="Add Landmark Pair">
        <font-awesome-icon icon="plus" />
      </div>
    </div>
    
  </div>
</template>
<script>

import LayerControl from '@/components/LayerControl'
import LandmarkControl from '@/components/LandmarkControl'

export default {
  components: {
    LandmarkControl,
    LayerControl
  },
  data: function () {
    return {
      showLandmarksControl: true,
    }
  },
  computed: {
    mode: {
      get: function () {
        return this.$store.state._step2Mode
      },
      set: function (mode) {
        /**
         * TODO remove this in release
         */
        this.$store.commit('_setStep2Mode', { mode })
      }
    },
    addBtnStyle: function () {
      return {
      }
    },
    modeBtnClass: function () {
      return this.mode === 'overlay'
        ? 'btn-secondary'
        : 'btn-info'
    },
    modeBtnTooltipText: function () {
      return `debug: toggle step 2 mode`
      return this.mode === 'overlay'
        ? `overlay mode`
        : `split screen mode`
    }
  },
  methods: {
    toggleMode: function () {
      this.mode = this.mode === 'overlay'
        ? 'classic'
        : 'overlay'
    },
    getYTranslateStyle: function (idx) {
      return {
        marginTop: `${idx * 2.5}em`
      }
    }
  }
}
</script>
<style scoped>
#flexcontainer
{
  display: flex;
  flex-direction: column;
  width: 2em;
}

#flexcontainer > *
{
  flex: 0 0 0;
}

.flex-items:not(:first-child)
{
  margin-top: -1em;
}
.addBtn
{
  pointer-events: all;
  display: inline-block;
  margin: 1.2em;
}
.btn-shadow {
  box-shadow: 0 0.4em 0.4em -0.1em rgba(50, 50, 50, 0.2);
}
.btn-shadow:hover {
  box-shadow: 0 0.6em 0.6em -0.2em rgba(50, 50, 50, 0.2);
}
</style>
