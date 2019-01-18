<template>
  <div>

    <!-- add load save -->
    <div class="btn-group mb-3">
      <button type="button" @click = "addLandmarkPair" class="btn btn-lg btn-success"><font-awesome-icon icon="plus"/> Add</button>
      <button type="button" @click = "loadLandmarkPairs" class="btn btn-lg btn-secondary"><font-awesome-icon icon="file-upload"/> Load</button>
      <button type="button" @click = "saveLandmarkPairs" class="btn btn-lg btn-secondary"><font-awesome-icon icon="file-download"/> Save</button>
    </div>
    
    <!-- select all/ remove all -->
    <div v-show = "!landmarkIsEmpty" class="input-group mb-2">
      <div class="input-group-prepend">
        <div class="btn btn-secondary">
          <input type = "checkbox" />
          select all
        </div>
      </div>
      <input style = "visibility: hidden" type="text" class = "form-control" />
      <div class="input-group-append">
        <div
          @click = "clearList"
          class="btn btn-danger"
          :disabled="this.$store.state.landmarkPairs.length == 0">
          <font-awesome-icon icon="trash-alt"/>
          Remove all
        </div>
      </div>
    </div>

    <!-- landmark rows -->
    <LandmarkRow
      :id = "lm.id"
      :active = "lm.active"
      :visible = "lm.visible"
      :name = "lm.name"
      :key = "lm.id"
      v-for = "lm in landmarks"
      :color = "lm.color" />
  </div>
</template>

<script>
import LandmarkRow from '@/components/Landmark'
import { oldJson } from '@/components/constants'

export default {
  name: 'LandmarkList',
  props: {},
  data: function () {
    return {
      checkAll: false,
      color: '#FCDC00'
    }
  },
  watch: {
    checkAll: function () {
      this.checkAllPairs()
    }
  },
  components: {
    LandmarkRow
  },
  methods: {
    /**
     * TODO
     */
    checkAllPairs: function () {
      this.$store.dispatch('enableLandmarkPairs', { enable: this.checkAll })
    },
    saveLandmarkPairs: function () {
    },
    addLandmarkPair: function () {
      this.$store.dispatch('addLandmarkPair')
    },
    loadLandmarkPairs: function () {
      this.$store.dispatch('loadOldJson', {
        json: oldJson,
        config: {
          fixCenterTranslation: true
        }
      })
    },
    clearList: function () {
      this.$store.dispatch('removeLandmarkPairs')
    },
  },
  computed: {
    landmarkIsEmpty: function () {
      return this.$store.state.landmarkPairs.length === 0
    },
    landmarks: function () {
      /**
       * expect landmarks to be [{id: UNIQUE_ID, name: NAME, color: HEX}]
       */

      // eslint-disable-next-line
      const { referenceLandmarks, incomingLandmarks, landmarkPairs } = this.$store.state
      return landmarkPairs
    }
  }
}
</script>

<style scoped>
</style>
