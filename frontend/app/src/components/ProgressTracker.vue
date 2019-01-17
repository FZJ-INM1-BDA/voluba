<template>
  <div class = "progress-tracker-container">
    <router-link
      class = "progress-tracker-item"
      :key = "route.name"
      :to = "route"
      v-for = "(route, index) in routes">

      <strong>
        Step {{ index + 1 }}
      </strong>
      <p class="description">
        {{ route.displayName }}
      </p>

    </router-link>
  </div>
</template>
<script>
export default {
  computed: {
    routes: function () {
      return this.$router.options.routes.filter(route => route.shown)
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
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
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
