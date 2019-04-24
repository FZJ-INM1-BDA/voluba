<template>
  <b-modal
    @hidden="onHiddenCleanup"
    centered
    ref="modal"
    :title="title"
    :header-bg-variant="overwriteVariant || defaultVariant"
    header-text-variant="light"
    :hide-footer="true">
    {{ message }}
    <div
      v-if="htmlMessage"
      v-html="htmlMessage">
    </div>
  </b-modal>
</template>
<script>
export default {
  data: function () {
    return {
      title: 'Note',
      message: '',
      htmlMessage: null,
      defaultVariant: 'info',
      overwriteVariant: null
    }
  },
  methods: {
    onHiddenCleanup: function () {
      this.overwriteVariant = null
      this.title = 'Node'
      this.message = ''
      this.htmlMessage = null
    }
  },
  mounted: function () {

    this.$store.subscribeAction (({type, payload}) => {
      if (type === 'modalMessage') {
        const modal = this.$refs.modal
        const { title, body, htmlBody, variant } = payload
        if (variant) {
          this.overwriteVariant = variant
        }
        if (modal) {
          this.title = title
          this.message = body
          this.htmlMessage = htmlBody
          modal.show()
        }
      }
    }) 
  }
}
</script>
<style scoped>

</style>
