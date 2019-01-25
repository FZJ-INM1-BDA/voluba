<template>
  <div>
    <div :style="layerControllerTransform" class="layerController">
      <div
        v-b-tooltip.right.hover
        :title="configureIncVolTooltip"
        :class="showLayerControl ? '' : 'btn-shadow'"
        @click="showLayerControl = !showLayerControl"
        class="rounded-circle layer-control-toggle btn btn-sm btn-secondary">
        <font-awesome-icon :icon="icon"/>
      </div>
      <layer-control
        @header-mosuedown="headerMousedown($event)"
        class="layer-control" v-if="computedShowLayerControl"/>
    </div>
  </div>
</template>
<script>
import LayerControl from "@/components/widgets/LayerControl";

export default {
  components: {
    LayerControl
  },
  data: function() {
    return {
      nehubaAppended: false,
      showLayerControl: false,
      transformX: 0,
      transformY: 0,

      mousedownX: null,
      mousedownY: null,
      mousemoveX: null,
      mousemoveY: null
    };
  },
  nonReactiveData: {
  },
  computed: {
    layerControllerTransform: function () {
      if ( this.mousedownX === null || this.mousedownY === null || this.mousemoveX === null || this.mousemoveY === null) {
        return {
          transform: `translate(${this.transformX}px, ${this.transformY}px)`
        }
      } else {
        const deltaX = this.mousemoveX - this.mousedownX
        const deltaY = this.mousemoveY - this.mousedownY

        return {
          transform: `translate(${this.transformX + deltaX}px, ${this.transformY + deltaY}px)`
        }
      }
    },
    incVolSelected: function () {
      return this.$store.state.incomingVolumeSelected
    },
    configureIncVolTooltip: function() {
      return `configure incoming volume`
    },
    computedShowLayerControl: function() {
      return this.nehubaAppended && this.showLayerControl
    },
    icon: function() {
      return this.showLayerControl
        ? "sliders-h" // 'times'
        : "sliders-h"
    }
  },
  methods: {
    headerMousedown: function (event) {
      this.mousedownX = event.clientX
      this.mousedownY = event.clientY

      const mousemoveHandler = event => {
        this.mousemoveX = event.clientX
        this.mousemoveY = event.clientY
      }
      
      document.addEventListener('mousemove', mousemoveHandler)
      document.addEventListener('mouseup', () => {

        this.transformX += this.mousemoveX - this.mousedownX
        this.transformY += this.mousemoveY - this.mousedownY

        this.mousemoveX = null
        this.mousemoveY = null
        this.mousedownX = null
        this.mousedownY = null

        document.removeEventListener('mousemove', mousemoveHandler)
      }, {
        once: true
      })
    }
  },
  mounted() {
    this.$store.state.appendNehubaPromise
      .then(() => this.nehubaAppended = true)
      .catch(console.error)
  }
};
</script>
<style scoped>
.layerController {
  pointer-events: all;
  width: 22em;
  margin-left: 1em;
  margin-top: 1em;
  position: relative;
}
.layer-control,
.layer-control-toggle {
  position: absolute;
  top: 0;
  left: 0;
}
.layer-control {
  z-index: 0;
  box-shadow: 0 0.4em 0.4em -0.2em rgba(50, 50, 50, 0.2);
}
.layer-control-toggle {
  z-index: 1;
  margin: 1em;
}

.btn-shadow {
  box-shadow: 0 0.4em 0.4em -0.1em rgba(50, 50, 50, 0.2);
}
.btn-shadow:hover {
  box-shadow: 0 0.6em 0.6em -0.2em rgba(50, 50, 50, 0.2);
}
</style>
