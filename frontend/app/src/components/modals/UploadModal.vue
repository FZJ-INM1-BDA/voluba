<template>
  <b-modal :id="id" title="Upload">
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
