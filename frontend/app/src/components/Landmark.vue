<template>
  <tr :style = "{opacity: active ? '1.0' : '0.3'}">
    <td><input type="checkbox" :checked = "active" @change = "toggleActive" /></td>
    <td>
      <div :style="{'background-color': color, 'min-width': '20px', 'max-width': '20px', 'min-height': '20px', 'border': '1px solid black'}"  v-b-tooltip.hover :title="color"></div>
    </td>
    <td><input class="form-control-sm" type="text" style="max-width: 110px;" v-model="name"></td>
    <td>
      <div class="btn-group">
        <button :style = "{opacity: visible? '1.0' : '0.3'}" @click.stop.prevent = "toggleVisibility" type="button" class="btn btn-sm btn-primary" v-b-tooltip.hover title="Go to landmark-pair">
          <font-awesome-icon :icon = "visible ? 'eye' : 'eye-slash'"/>
        </button>
        <button
          v-b-tooltip.hover title="Reset landmark-pair"
          @click.stop.prevent = "focusLandmark"
          type="button"
          class="btn btn-sm btn-warning">
          <font-awesome-icon icon="thumbtack" style="color: white;"/>
        </button>
        <button type="button" class="btn btn-sm btn-danger" v-b-tooltip.hover title="Remove landmark-pair">
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
    color: String,
    active: Boolean,
    visible: Boolean
  },
  watch: {
  },
  methods: {
    toggleActive: function () {
      this.$store.dispatch('toggleLandmarkPairActive', {
        id: this.id
      })
    },
    toggleVisibility: function () {
      this.$store.dispatch('toggleLandmarkPairVisibility', {
        id: this.id
      })
    },
    focusLandmark: function () {
      this.$store.dispatch('focusLandmarkPair', {
        id: this.id
      })
    }
  },
  computed: {}
}
</script>

<style scoped>
</style>
