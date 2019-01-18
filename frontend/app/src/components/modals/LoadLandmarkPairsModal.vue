<template>
  <b-modal
    :id = "id"
    ref = "modal"
    title="Load Landmark-Pairs"
    header-bg-variant="secondary"
    header-text-variant="light"
    ok-variant = "secondary"
    ok-title = "Cancel"
    ok-only>
    
    <button
      type="button"
      @click="loadLandmarkPairs"
      class="btn btn-secondary">
      Load old JSON
    </button>
  </b-modal>
</template>

<script>
import { oldJson } from '@/components/constants'

export default {
  name: 'UploadModal',
  props: {
    id: String
  },
  data: function () {
    return {
    }
  },
  methods: {
    hide: function () {
      this.$refs.modal.hide()
    },
    loadLandmarkPairs: function () {
      this.hide()

      this.$store.dispatch('loadOldJson', {
        json: oldJson,
        config: {
          fixCenterTranslation: true
        }
      })
    },
  },
  computed: {}
}
</script>

<style scoped>
</style>
