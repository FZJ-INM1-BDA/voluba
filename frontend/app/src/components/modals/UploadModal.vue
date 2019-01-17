<template>
  <b-modal :id="id" title="Upload" header-bg-variant="secondary" header-text-variant="light">
    <p>Text</p>
  </b-modal>
</template>

<script>
export default {
  name: 'UploadModal',
  props: {
    id: String
  },
  data: function () {
    return {
    }
  },
  methods: {},
  computed: {}
}
</script>

<style scoped>
</style>
