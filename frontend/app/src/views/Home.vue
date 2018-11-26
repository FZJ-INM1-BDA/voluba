<template>
  <div class="container-fluid">
    <nehuba-component @ready = "nehubaReady('nehuba1', $event)" />
  </div>
</template>

<script>
import NehubaComponent from '@/components/Nehuba'
export default {
  components: {
    NehubaComponent
  },
  methods: {
    nehubaReady: function (id, event) {
      /**
       * NB: mount nehubacomponent 1 at a time, and only after the ready event has been fired.
       */
      console.log('nehuba is ready', id, event)
    }
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
