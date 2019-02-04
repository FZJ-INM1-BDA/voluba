<template>
  <div>

    <!-- header -->
    <div
      class="card bg-light"
      @mousedown="$emit('header-mousedown', $event)">
      <h5 class="title">
        Landmark Control
      </h5>
    </div>

    <!-- body -->
    <landmark-list class="body" />
  </div>
</template>
<script>

import LandmarkList from '@/components/LandmarkList'
export default {
  components: {
    LandmarkList
  }
}
</script>
<style scoped>

.title
{
  padding-left: 1em;
  padding-right: 1.5em;
  padding-top: 3em;
  padding-bottom:0.5em;
  margin-bottom:0;

  transition: linear 150ms all;
}
.title:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
}

.body
{
  padding: 1em;
}
</style>
