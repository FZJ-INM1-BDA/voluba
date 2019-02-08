<template>
  <div>
    <LandmarkRowV2
      :showLink="showLink"
      v-for="lm in landmarks"
      :landmark="lm"
      :key="lm.id"/>
  </div>  
</template>
<script>
import LandmarkRowV2 from '@/components/LandmarkRowV2'
export default {
  props: {
    showLink: {
      type: Boolean,
      default: false
    },
    landmarks: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  components: {
    LandmarkRowV2
  }
}
</script>
<style scoped>

</style>
