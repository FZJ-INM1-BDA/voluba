<template>
  <div>
    <DataSelectionModal ref = "dataselectionModal" />
  </div>  
</template>
<script>
import DataSelectionModal from '@/components/modals/SelectVolumes'
export default {
  mounted() {
    
  },
  components: {
    DataSelectionModal
  }
}
</script>
<style scoped>

</style>
