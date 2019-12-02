<template>
  <div>

    <!-- name -->
    <div class="input-group input-group-sm">
      <div class="input-group-prepend">
        <span class="input-group-text">
          name
        </span>
      </div>
      <input
        @keydown="keydown"
        ref="landmarkName"
        class="form-control from-control-sm"
        type="text"
        tabindex="1"
        v-model="name">
    </div>

    <!-- volume -->
    <div class="input-group input-group-sm">
      <div class="input-group-prepend">
        <span class="input-group-text">
          volume
        </span>
      </div>
      <input type="text" class="form-control" :value="volume" disabled="disabled">
    </div>

    <!-- coord -->
    <div class="input-group input-group-sm mb-2">
      <div class="input-group-prepend">
        <span class="input-group-text">
          position
        </span>
      </div>
      <input type="text" class="form-control" disabled="disabled" :value="position">

      <div class="input-group-append">
        <span class="input-group-text">
          mm
        </span>
      </div>
    </div>

    <!-- delete lm -->
    <div
      @click="$emit('removeLm')"
      class="btn btn-danger">
      <font-awesome-icon icon="trash-alt"></font-awesome-icon>
      delete this landmark
    </div>
  </div>
</template>
<script>
export default {
  props: {
    landmark: {
      type: Object,
      default: null
    },
    volume: {
      type: String,
      default: null
    }
  },
  methods: {
    keydown: function (event) {
      if (event.key === 'Escape' || event.key === 'Enter' ) {
        this.$refs.landmarkName.blur()
      }
    }
  },
  computed: {
    position: function () {
      return this.landmark && this.landmark.coord
        ? this.landmark.coord.map(v => v.toFixed(3)).join(', ')
        : ``
    },
    name: {
      get: function () {
        return this.landmark && typeof this.landmark.name !== 'undefined' && this.landmark.name !== null
          ? this.landmark.name
          : `Untitled`
      },
      set: function (val) {
        this.$emit('changeName', {name: val})
      }
    }
  }
}
</script>
<style scoped>

</style>
