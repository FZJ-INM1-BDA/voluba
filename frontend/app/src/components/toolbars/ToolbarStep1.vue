<template>
  <div>
    <div class="layerController">
      <div
        :class = "showLayerControl ? '' : 'btn-shadow'"
        @click = "showLayerControl = !showLayerControl"
        class="layer-control-toggle btn btn-sm btn-secondary">
        <font-awesome-icon :icon = "icon" />
      </div>
      <layer-control
        class = "layer-control"
        v-if = "commputedShowLayerControl" />
    </div>
  </div>
</template>
<script>
import LayerControl from '@/components/widgets/LayerControl'


export default {
  components: {
    LayerControl
  },
  data: function () {
    return {
      nehubaAppended: false,
      showLayerControl: false
    }
  },
  computed: {
    commputedShowLayerControl: function () {
      return this.nehubaAppended && this.showLayerControl
    },
    icon: function () {
      return this.showLayerControl
        ? 'times'
        : 'sliders-h'
    }
  },
  mounted() {
    this.$store.state.appendNehubaPromise
      .then(() => this.nehubaAppended = true)
      .catch(console.error)
  },
}
</script>
<style scoped>
.layerController
{
  pointer-events: all;
  width: 22em;
  margin-left: 1em;
  margin-top: 1em;
  position: relative;
}
.layer-control,
.layer-control-toggle
{
  position:absolute;
  top:0;
  left:0;
}
.layer-control
{
  z-index: 0;
  box-shadow: 0 0.4em 0.4em -0.2em rgba(50, 50, 50, 0.2);
}
.layer-control-toggle
{
  z-index: 1;
  margin: 1em;
}

.btn-shadow
{
  box-shadow: 0 0.4em 0.4em -0.1em rgba(50, 50, 50, 0.2);
}
.btn-shadow:hover
{
  box-shadow: 0 0.6em 0.6em -0.2em rgba(50, 50, 50, 0.2);
}
</style>
