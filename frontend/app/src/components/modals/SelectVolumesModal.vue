<template>
  <b-modal
    @hidden="onHidden"
    :hide-header-close="true"
    :hide-footer="true"
    :no-close-on-esc="true"
    :no-close-on-backdrop="true"
    centered
    ref="modal"
    header-bg-variant="secondary"
    header-text-variant="light"
    title="Select Dataset"
    :id="id">

    <data-selection
      @destroyMe="destroyMe"/>
  </b-modal>
</template>
<script>
import DataSelection from '@/components/DatasetSelection'
export default {
  mounted() {
    this.$refs.modal.show()
  },
  props: {
    id: String
  },
  components: {
    DataSelection
  },
  methods: {
    destroyMe: function () {
      this.$refs.modal.hide()
    },
    onHidden: function () {
      this.$emit('destroyMe')
    }
  }
}
</script>
<style scoped>

</style>
