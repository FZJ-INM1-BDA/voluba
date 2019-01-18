<template>
  <b-modal :id="id" title="Load Landmark-Pairs" header-bg-variant="secondary" header-text-variant="light" cancel-only>
    <button type="button" @click="loadLandmarkPairs" class="btn btn-secondary">Load old JSON</button>
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
    loadLandmarkPairs: function () {
      console.log(this.$refs)
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
