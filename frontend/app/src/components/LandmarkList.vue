<template>
  <table class="table">
    <thead>
      <tr>
        <th><input type="checkbox" id="check-all" v-model="checkAll" /></th>
        <th>Color</th>
        <th>Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <slot name="body"/>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'LandmarkList',
  props: {},
  data: function () {
    return {}
  },
  methods: {},
  computed: {}
}
</script>

<style scoped>
</style>
