<template>
  <div>
    <h4>
      {{ inputTitle }}
    </h4>

    <!-- show resume list workflow -->
    <ul class="list-group" v-if="isHbpOidcV2">
      <li
        :id="workflow.name | xformNameToId"
        :key="workflow.name"
        @mouseover="workflowDetailOnFocus = workflow.name"
        @mouseleave="workflowDetailOnFocus = null"
        v-for="workflow in workflows"
        class="list-group-item text-nowrap">
        <button @click="loadState(workflow.name)" class="btn btn-sm btn-default">
          {{ workflow.name }}
        </button>
      </li>
    </ul>

    <!-- show if not hpboidc v2 -->
    <div v-else class="alert alert-warning">
      Saving and resuming workflows are only available to HBP KeyCloak signins.
    </div>

    <!-- tooltip showing more info -->
    <b-tooltip placement="bottom"  v-if="workflowDetailOnFocus" :target="workflowDetailOnFocus | xformNameToId">
      <div v-if="fetchingWorkflowDetail">
        Loading ...
      </div>
      <pre v-else-if="workflowDetail">
        {{ workflowDetail | showWorkflowDetail }}
      </pre>
      <div class="alert alert-danger" v-else-if="workflowDetailError">
        {{ workflowDetailError.toString() }}
      </div>
      <div v-else>
        hmm?
      </div>
    </b-tooltip>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import axios from 'axios'

const NEW_REQ = `NEW_REQ`

const removeJsonExt = function (value) {
  return value.replace(/\.json$/, '')
}

export default {
  props: {
    inputTitle: {
      type: String,
      default: 'Resume workflow'
    }
  },
  computed: {
    ...mapGetters('authStore', [
      'isHbpOidcV2'
    ])
  },
  mounted() {
    if (this.isHbpOidcV2) {
      this.fetchWorkflows()
    }
  },
  watch: {
    workflowDetailOnFocus: function (id) {
      if (this.cancelToken) {
        this.cancelToken.cancel(NEW_REQ)
      } 
      if (!id) return

      this.fetchWorkflowInfo(id)
    }
  },
  methods: {
    ...mapActions([
      'modalMessage'
    ]),
    ...mapMutations([
      'sudoSetState'
    ]),
    loadState: function (id) {
      axios.get(`user/workflow/${removeJsonExt(id)}`)
        .then(({ data }) => {
          this.sudoSetState(data)
          this.$emit('destroyMe')
        })
        .catch(e => this.modalMessage({
          title: 'Error',
          variant: 'danger',
          body: `Error resuming workflow: ${e.toString()}`
        }))
    },
    fetchWorkflows: function () {
      if (this.fetchingWorkflows) return
      this.fetchingWorkflows = true
      axios.get('user/workflow/')
        .then(({ data }) => {
          this.workflows = data
        })
        .catch(e => {
          this.fetchWorkflowsError = e
        })
        .finally(() => {
          this.fetchingWorkflows = false
        })
    },
    fetchWorkflowInfo: function (id) {
      this.workflowDetailError = null
      this.workflowDetail = null
      if (this.cancelToken) {
        this.cancelToken.cancel(NEW_REQ)
      } 
      
      this.fetchingWorkflowDetail = true
      this.cancelToken = axios.CancelToken.source()
      axios.get(`user/workflow/${removeJsonExt(id)}`, {
        cancelToken: this.cancelToken.token
      })
        .then(({ data }) => {
          this.workflowDetail = data
        })
        .catch(e => {
          if (!axios.isCancel(e)) {
            this.workflowDetailError = e
          }
        })
        .finally(() => {
          this.cancelToken = null
          this.fetchingWorkflowDetail = false
        })
    }
  },
  data: function () {
    return {
      cancelToken: null,
      workflows: [],
      fetchingWorkflows: false,
      fetchWorkflowsError: null,

      fetchingWorkflowDetail: false,
      workflowDetailOnFocus: null,
      workflowDetail: null,
      workflowDetailError: null
    }
  },
  filters: {
    xformNameToId: function (name) {
      return name && `list-item-${name.replace(/\.json$/, '')}` || null
    },
    showWorkflowDetail: function ({ undoStore, landmarksStore, dataSelectionStore }) {
      const { undoStack, redoStack } = undoStore
      const { landmarkPairs } = landmarksStore
      const {
        selectedReferenceVolumeId,
        referenceVolumes,
        selectedIncomingVolumeId,
        incomingVolumes
      } = dataSelectionStore

      const incomingVolume = incomingVolumes.find(v => v.id === selectedIncomingVolumeId)
      return `
Incoming Volume: ${(incomingVolume && incomingVolume.name) || ('Unknown or deleted incoming volume with id:' + selectedIncomingVolumeId)}
Landmarks: ${landmarkPairs.length} pairs
Operations (Undo/Redo): ${undoStack.length + redoStack.length}
`
    }
  }
}
</script>
<style scoped>

</style>