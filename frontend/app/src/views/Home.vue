<template>
  <div class="container-fluid">
    <nehuba-component />
  </div>
</template>

<script>
import NehubaComponent from '@/components/Nehuba'
export default {
  components: {
    NehubaComponent
  }
}
</script>

<style scoped>
div.container-fluid,
nehuba-component
{
  height:100%;
  padding:0;
}
</style>
