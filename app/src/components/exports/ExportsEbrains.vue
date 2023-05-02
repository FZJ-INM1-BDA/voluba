<template>
  <div>
    <b-button @click="start"
      :disabled="isBusy"
      class="start-button"
      variant="primary">
      Start
    </b-button>
    <b-alert v-for="pollResult in pollResults"
      :key="pollResult.name"
      :variant="pollResult.status | variantFilter"
      show>
      <span>
        {{ pollResult.name }}: {{ pollResult.status }}
      </span>
      <font-awesome-icon
        v-if="pollResult.status === 'ERROR'"
        v-b-tooltip.hover="pollResult.detail"
        icon="question" />
    </b-alert>
  </div>
</template>
<script>
import { getExportJson } from "@/store"

const hostname = 'http://localhost:5000'
export default {
  data() {
    return {
      isBusy: false,
      error: null,
      pollResults: [],
      jobId: null,
      periodicId: null,
    }
  },
  filters: {
    variantFilter(value) {
      if (value === "COMPLETED") {
        return 'success'
      }
      if (value === "ERROR") {
        return 'danger'
      }
      if (value === "RUNNING") {
        return 'primary'
      }
      return 'light'
    }
  },
  methods: {
    start() {
      this.isBusy = true
      this.submit()
    },
    async submit() {
      const { state, getters } = this.$store
      const json = getExportJson({ state, getters })
      try {
        const resp = await fetch(`${hostname}/ebrains`, {
          method: 'POST',
          body: JSON.stringify(json),
          headers: {
            'content-type': 'application/json'
          }
        })
        const result = await resp.json()
        this.jobId = result.job_id
        this.startPeriodic()
      } catch (e) {
        console.log('error', e)
        this.isBusy = false
      }

    },
    clearPeriodic(){
      if (this.periodicId) {
        clearInterval(this.periodicId)
      }
    },
    startPeriodic() {
      this.clearPeriodic()
      this.periodicId = setInterval(() => {
        this.poll()
      }, 1000)
    },
    async poll() {

      if (this.jobId) {

        const resp = await fetch(`${hostname}/ebrains/${this.jobId}`)

        const { progresses } = await resp.json()
        this.pollResults = progresses

        const allSuccesses = this.pollResults.every(v => v.status === "COMPLETED")
        const someFailures = this.pollResults.some(v => v.status === 'ERROR')
        if (allSuccesses || someFailures) {
          this.clearPeriodic()
          this.isBusy = false
        }
      }
    }
  }
}
</script>
<style>
.start-button
{
  display: block;
  width:100%;
}
</style>
