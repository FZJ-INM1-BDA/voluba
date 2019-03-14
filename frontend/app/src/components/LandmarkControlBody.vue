<template>
  <div>

    <!-- header -->
    <div
      class="card bg-light"
      @mousedown="$emit('header-mousedown', $event)">
      <h5 class="title">
        {{ editLandmarksTitle }}
      </h5>
    </div>

    <!-- body --> 
    <div class="body card bg-light">

      <!-- select all/ remove all -->
      <div v-if="!landmarkIsEmpty" class="input-group mb-2">
        <div class="input-group-prepend">
          <div @click.stop.prevent="toggleCheckAll" class="btn btn-secondary">
            <input id="checkAll" name="checkAll" v-model="checkAll" type="checkbox" />
            All
          </div>
        </div>
        <input style="visibility: hidden" type="text" class="form-control" />
        <div class="input-group-append">
          <div
            @click="removeAllLmsLmps"
            class="btn btn-danger"
            :disabled="this.$store.state.landmarkPairs.length == 0">
            <font-awesome-icon icon="trash-alt"/>
            All
          </div>
        </div>
      </div>

      <div class="text-muted" v-else>
        {{ lmPlaceHolderText }}
      </div>

      <!-- landmark rows -->
      <LandmarkRow
        :id = "lm.id"
        :active = "lm.active"
        :name = "lm.name"
        :key = "lm.id"
        v-for = "lm in landmarks"
        :color = "lm.color" />
    </div>
  </div>
</template>
<script>

import { mapActions } from 'vuex'

import LandmarkRow from '@/components/Landmark'
import { EDIT_LANDMARKS_TITLE, TWO_PANE_ADD_SOME_LM_TEXT } from '@/text'
export default {
  components: {
    LandmarkRow
  },
  watch: {
    checkAll: function () {
      this.checkAllPairs()
    }
  },
  data: function () {
    return {
      checkAll: true
    }
  },
  methods: {
    ...mapActions({
      removeAllLmsLmps: 'removeAllLmsLmps'
    }),
    toggleCheckAll: function () {
      this.checkAll = !this.checkAll
      this.checkAllPairs()
    },
    checkAllPairs: function () {
      this.$store.dispatch('enableLandmarkPairs', { enable: this.checkAll })
    }
  },
  computed: {
    lmPlaceHolderText: function () {
      return TWO_PANE_ADD_SOME_LM_TEXT
    },
    editLandmarksTitle: function () {
      return EDIT_LANDMARKS_TITLE
    },
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
  padding: 0.5em;
}

</style>
