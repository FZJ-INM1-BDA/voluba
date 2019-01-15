<template>
  <div class = "nehubaElement" :id = "cid">
    {{ placeholderText }}
  </div>
</template>
<script>
export default {
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      loadingText: 'Loading simple nehuba ...',
      cid: null,
      nehubaViewer: null,
      errorMessage: null
    }
  },
  beforeMount() {
    if (!this.config) {
      this.errorMessage = 'config object not provided, simple  nehuba will not load'
      return
    }
    this.cid = 'neuroglancer-container'
  },
  mounted() {
    if (this.config) {
      this.initNehuba()
    } else {
      this.errorMessage = `incoming dataset not set`
    }
  },
  computed: {
    placeholderText: function () {
      return this.errorMessage
        ? this.errorMessage
        : this.loadingText
    }
  },
  methods: {
    initNehuba: function () {
      this.nehubaViewer = window.export_nehuba.createNehubaViewer(this.config, (err) => {
        console.log(e)
      })

      /**
       * clear window.viewer object
       */
      window.secondaryViewer = window.viewer
      window.viewer = null
    },
    onError: function (e) {
      this.errorMessage = e
    }
  },
  beforeDestroy() {
    if (window.secondaryViewer)
      window.secondaryViewer = null
    if (this.nehubaViewer)
      this.nehubaViewer.dispose()
  },
}
</script>
<style scoped>
.nehubaElement
{
  width: 100%;
  height: 100%;
}
</style>
