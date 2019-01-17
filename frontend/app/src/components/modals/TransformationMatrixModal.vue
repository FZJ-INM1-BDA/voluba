<template>
  <b-modal :id="id" title="Transformation Matrix">
    <p>{{ transformationMatrix }}</p>
  </b-modal>
</template>

<script>
export default {
  name: 'TransformationMatrixModal',
  props: {
    id: String,
    transformationMatrix: Object
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
