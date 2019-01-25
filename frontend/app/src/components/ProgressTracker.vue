<template>
  <div class="progress-tracker-container">
    <div 
      @click="startFromScratch"
      class="text-danger btn btn-sm btn-dark">
      <font-awesome-icon class="icon" icon="backward"/>start from scratch
    </div>
    <div
      @click="prevStep"
      :style="canGoBack?{}:extraMuted"
      :class="canGoBack?'':'disabled'"
      class="btn btn-sm btn-dark">
      <font-awesome-icon class="icon" icon="step-backward"/>back
    </div>
    <div
      :class="activeRouteIndex === index ? 'router-link-active' : ''"
      class="progress-tracker-item"
      :key="index"
      v-for="(route, index) in routes"
    >
      <strong>Step {{ index + 1 }}</strong>
      <p class="description">{{ route.displayName }}</p>
    </div>

    <div
      @click="nextStep"
      :style="canGoForward?{}:extraMuted"
      :class="canGoForward?'':'disabled'"
      class="btn btn-sm btn-dark">
      <font-awesome-icon class="icon" icon="step-forward"/>next
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    prevStep: function () {
      if (!this.canGoBack) {
        return
      }
      const index = this.$route.meta.index
      const newroute = this.$router.options.routes.find(route => route.meta && route.meta.index === index - 1)
      if (newroute) {
        this.$router.push(newroute)
      } else {
        console.log('could not find the route')
      }
    }, 
    nextStep: function () {
      if (!this.canGoForward) {
        return
      }
      
      const index = this.$route.meta.index
      const newroute = this.$router.options.routes.find(route => route.meta && route.meta.index === index + 1)
      if (newroute) {
        this.$router.push(newroute)
      } else {
        console.log('could not find the route')
      }
    },
    startFromScratch: function () {
      this.$router.push({path: '/'})
    }
  },
  computed: {
    canGoBack: function () {
      return !this.$route.meta.firstStep
    },
    canGoForward: function () {
      return !this.$route.meta.lastStep
    },
    routes: function() {
      return this.$router.options.routes.filter(route => route.shown)
    },
    activeRouteIndex: function() {
      return this.routes.findIndex(r => r.path === this.$route.path)
    },
    extraMuted: function () {
      return {
        opacity: 0.2
      }
    }
  }
};
</script>
<style scoped>
.icon {
  margin-right: 0.3em;
}
.btn {
  text-align:end;
}
.progress-tracker-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.progress-tracker-container > * {
  margin-left: 2em;
}

.progress-tracker-item {
  color: rgba(255, 255, 255, 0.6);
}

.progress-tracker-item:hover {
  cursor: default;
}

.progress-tracker-item.router-link-active {
  color: rgba(255, 255, 255, 1);
}

.description {
  font-size: 12px;
  margin-bottom: 0px;
}
</style>
