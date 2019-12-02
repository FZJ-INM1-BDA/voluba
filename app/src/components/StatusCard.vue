<template>
  <div>
    <!-- align -->
    <div class="btn-group">
      <div @click = "alignReference" class="btn btn-primary">align reference</div>
      <div @click = "alignIncoming" class="btn btn-primary">align incoming</div>
    </div>
    <br>
    <label>Mouse position: {{ viewerMouse.join(', ') }} </label>  
  </div>  
</template>
<script>
export default {
  computed: {
    
    viewerMouse: function () {
      return this.$store.state.viewerMousePosition
    }
  },
  methods: {
    
    alignReference: function () {
      this.$store.dispatch('alignReference')
    },
    alignIncoming: function () {
      this.$store.dispatch('alignIncoming')
    },
  },
}
</script>
<style scoped>

</style>
