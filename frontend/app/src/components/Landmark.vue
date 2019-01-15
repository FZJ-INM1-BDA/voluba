<template>
  <tr>
    <td><input type="checkbox" v-model="active" /></td>
    <td>
      <div :style="{'background-color': color, 'min-width': '20px', 'max-width': '20px', 'min-height': '20px', 'border': '1px solid black'}"></div>
    </td>
    <td><input class="form-control-sm" type="text" style="max-width: 110px;" v-model="name"></td>
    <td>
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-primary">
          <font-awesome-icon icon="eye"/>
        </button>
        <button type="button" class="btn btn-sm btn-warning">
          <font-awesome-icon icon="thumbtack" style="color: white;"/>
        </button>
        <button type="button" class="btn btn-sm btn-danger">
          <font-awesome-icon icon="trash-alt"/>
        </button>
      </div>
    </td>
  </tr>
</template>

<script>
export default {
  name: 'Landmark',
  props: {
    id: String,
    name: String,
    color: String
  },
  data: function () {
    return {
      active: true
    }
  },
  watch: {
    active: function () {
      this.activeChanged()
    },
  },
  methods: {
    activeChanged: function () {
      // TODO: implement
    },
  },
  computed: {}
}
</script>

<style scoped>
</style>
