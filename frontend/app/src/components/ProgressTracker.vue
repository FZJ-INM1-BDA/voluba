<template>
  <div class = "progress-tracker-container">

    <div
      :class = "activeRouteIndex === index ? 'router-link-active' : ''"
      class = "progress-tracker-item"
      :key="index"
      v-for="(route, index) in routes">
      <strong>
        Step {{ index + 1 }}
      </strong>
      <p class="description">
        {{ route.displayName }}
      </p>
    </div>

  </div>
</template>
<script>
export default {
  computed: {
    routes: function () {
      return this.$router.options.routes.filter(route => route.shown)
    },
    activeRouteIndex: function () {
      return this.routes.findIndex(r => r.path === this.$route.path)
    }
  }
}
</script>
<style scoped>
.progress-tracker-container
{
  display:flex;
  flex-direction: row;
}

.progress-tracker-container > *
{
  margin-left: 2em;
}

.progress-tracker-item
{
  color: rgba(255, 255, 255, 0.6);
}

.progress-tracker-item:hover
{
  cursor: default;
}

.progress-tracker-item.router-link-active
{
  color: rgba(255, 255, 255, 1.0);
}

.description
{
  font-size: 12px;
  margin-bottom: 0px;
}
</style>
