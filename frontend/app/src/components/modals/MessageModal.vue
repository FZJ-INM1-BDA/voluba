<template>
  <b-modal
    centered
    ref="modal"
    :title="title"
    header-bg-variant="danger"
    header-text-variant="light"
    :hide-footer="true">
    {{ message }}
  </b-modal>
</template>
<script>
export default {
  data: function () {
    return {
      title: 'Note',
      message: ''
    }
  },
  mounted: function () {
    this.$store.subscribeAction (({type, payload}) => {
      if (type === 'modalMessage') {
        const modal = this.$refs.modal
        const { title, body } = payload
        if (modal) {
          this.title = title
          this.message = body
          modal.show()
        }
      }
    }) 
  }
}
</script>
<style scoped>

</style>
