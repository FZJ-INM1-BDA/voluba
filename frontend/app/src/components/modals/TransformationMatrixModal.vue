<template>
  <b-modal :id="id" title="Transformation Matrix" header-bg-variant="secondary" header-text-variant="light" ok-only>
    <table class="table table-hover">
      <tbody>
        <tr :key = "rowIndex" v-for = "(row, rowIndex) in transformationMatrix">
          <td :key = "cellIndex" v-for = "(value, cellIndex) in row">{{ (value).toFixed(4) }}</td>
        </tr>
      </tbody>
    </table>
  </b-modal>
</template>

<script>
export default {
  name: 'TransformationMatrixModal',
  props: {
    id: String,
    transformationMatrix: Array
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
