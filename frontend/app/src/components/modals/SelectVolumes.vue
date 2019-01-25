<template>
  <b-modal
    :hide-header-close	="true"
    :hide-footer="true"
    :no-close-on-esc= "true"
    centered
    ref="modal"
    header-bg-variant="secondary"
    header-text-variant="light"
    title="Select Dataset"
    :id="id">

    <data-selection />
  </b-modal>
</template>
<script>
import DataSelection from '@/components/DatasetSelection'
export default {
  mounted() {
    this.$refs.modal.show()
  },
  beforeDestroy() {
    this.$refs.modal.hide()
  },
  props: {
    id: String
  },
  components: {
    DataSelection
  }
}
</script>
<style scoped>

</style>
