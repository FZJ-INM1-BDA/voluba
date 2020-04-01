<template>
  <div>
    <LandmarkRowV2
      @changeName="$emit('changeName',  {...$event, id: lm.id})"
      :showAppend="showAppend"
      v-for="lm in landmarks"
      class="mb-1"
      :landmark="lm"
      :key="lm.id"/>
  </div>  
</template>
<script>
import LandmarkRowV2 from '@/components/LandmarkRowV2'
export default {
  props: {
    showAppend: {
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
