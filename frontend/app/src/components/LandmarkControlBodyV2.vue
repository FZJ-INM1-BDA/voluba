<template>
  <div>

    <!-- header -->
    <div class="card bg-light" @mousedown="$emit('header-mousedown', $event)">
      <h5 class="title">
        Landmark Control V2
      </h5>
    </div>

    <div class="bg-light">

      <!-- add load save -->
      <div class="btn-group mb-3">
        <button
          type="button"
          @click="$store.dispatch('loadLandmarks')"
          class="btn btn-lg btn-secondary">
          <font-awesome-icon icon="file-upload"/>
          Load
        </button>
      </div>
    </div>

    <div class="bg-light">
      <b-tabs>
        <b-tab @click="toggleLandmark('reference')" :active="_step2OverlayFocus === 'reference'" title="Reference">

        </b-tab>
        <b-tab @click="toggleLandmark('incoming')" :active="_step2OverlayFocus === 'incoming'" title="Incoming">

        </b-tab>
      </b-tabs>
    </div>

    <!-- primary landmarks -->
    <div class="body bg-light">
      <LandmarkRowV2
        class="mb-1"
        @changeName="$store.dispatch('changeLandmarkName', {...$event, id: lm.id, volume: _step2OverlayFocus})"
        :key="lm.id"
        :landmark="lm"
        v-for="lm in primaryLandmarks">

        <!-- append icons -->
        <template slot="append">
          
          <div
            :id="'lmRow' + lm.id"
            @mouseleave="mouseoverId=null"
            class="input-group-append">

            <!-- go to landmark -->
            <button
              v-if="mouseoverId === lm.id"
              @click.stop.prevent = "gotoLandmark"
              type="button"
              class="btn btn-sm btn-primary"
              v-b-tooltip.hover title="Go to landmark">
              <font-awesome-icon icon = "map-marker-alt"/>
            </button>

            <!-- relocate landmark -->
            <button
              v-if="mouseoverId === lm.id"
              v-b-tooltip.hover
              title="Reset landmark to current location"
              @click.stop.prevent = "resetLandmark"
              type="button"
              class="btn btn-sm btn-warning">
              <font-awesome-icon icon="thumbtack" style="color: white;"/>
            </button>

            <!-- trash landmark -->
            <button
              v-if="mouseoverId === lm.id"
              @click.stop.prevent = "removeLandmark"
              type="button"
              class="btn btn-sm btn-danger"
              v-b-tooltip.hover title="Remove landmark">
              <font-awesome-icon icon="trash-alt"/>
            </button>

            <!-- link btn -->
            <button
              v-if="mouseoverId === lm.id"
              @click.stop.prevent="showPopoverId = lm.id"
              type="button"
              v-b-tooltip.hover title="Paired landmark"
              class="btn btn-sm btn-secondary">
              <font-awesome-icon icon="link"/>
            </button>

            <button
              v-if="lm.id !== mouseoverId"
              @mouseenter="mouseoverId=lm.id"
              class="btn btn-sm btn-secondary">
              <font-awesome-icon
                icon="ellipsis-h">
                <!-- :icon="lmIconOpenSet.findIndex(i => i === lm.id) < 0? 'ellipsis-h' : 'times'"> -->
                </font-awesome-icon>
            </button>

          </div>
        </template>

      </LandmarkRowV2>
    </div>

    <!-- popover -->
    <b-popover
      v-if="popoverTarget"
      ref="popoverLinkLandmark"
      placement="rightbottom"
      :target="popoverTarget">
      <template slot="title">
        <div>
          {{ popoverTitle }}
        </div>
      </template>
      <div class="body bg-light" >
        <LandmarkRowV2
          :key="lm.id"
          :landmark="lm"
          v-for="lm in secondaryLandmarks">
          <template slot="prepend">
            <div class="input-group-prepend">

              <!-- tooltip wrapper -->
              <div v-b-tooltip="'test'">
                <div class="btn btn-secondary">
                  <font-awesome-icon icon="link"></font-awesome-icon>
                </div>
              </div>
            </div>
          </template>
        </LandmarkRowV2>
      </div>
    </b-popover>

  </div>
</template>
<script>
import LandmarkRowV2 from '@/components/LandmarkRowV2'
export default {
  components: {
    LandmarkRowV2
  },
  data: function () {
    return {
      mouseoverId: null,
      showPopoverId: null,
      lmIconOpenSet: []
    }
  },
  methods: {
    toggleLmIcons: function (id) {
      const foundId = this.lmIconOpenSet.find(i => i === id)
      if (foundId) {
        this.lmIconOpenSet = this.lmIconOpenSet.filter(i => i !== id)
      } else {
        this.lmIconOpenSet = this.lmIconOpenSet.concat(id)
      }
    },
    toggleLandmark: function (mode) {
      this.$store.commit('_setStep2OverlayFocus', { mode })
    }
  },
  watch: {
    showPopoverId: function (val) {
      if (!this.$refs.popoverLinkLandmark) 
        return

      // this.$refs.popoverLinkLandmark.$emit('close')
      // if (val) {
      //   this.$refs.popoverLinkLandmark.$emit('open')
      // }
    }
  },
  computed: {
    popoverTarget: function () {
      return this.mouseoverId
        ? `lmRow${this.mouseoverId}`
        : null
    },
    popoverTitle: function () {
      return this._step2OverlayFocus === 'reference' ? 'Incoming Volume Landmarks' : 'Reference Volume Landmarks'
    },
    primaryLandmarks: function () {
      return (this._step2OverlayFocus === 'reference'
        ? this.referenceLandmarks
        : this.incomingLandmarks).map(lm => {
          return {
            ...lm,
            showIcon: this.lmIconOpenSet.findIndex(i => i === lm.id) >= 0
          }
        })
    },
    secondaryLandmarks: function () {
      return this._step2OverlayFocus === 'reference'
        ? this.incomingLandmarks
        : this.referenceLandmarks
    },  
    _step2OverlayFocus: function () {
      return this.$store.state._step2OverlayFocus
    },
    incomingLandmarks: function () {
      return this.$store.state.incomingLandmarks
    },
    referenceLandmarks: function () {
      return this.$store.state.referenceLandmarks
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
  padding: 1em;
}
</style>
