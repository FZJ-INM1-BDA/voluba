<template>
  <LandmarkRowV2
    :draggable="!parentLandmark"
    @dragstart.native="dragStart"
    @dragend.native="dragEnd"
    :landmark="landmark"
    :style="dragInProgress ? {opacity: 0.2} : {}"
    class="container"
    @changeName="changeLandmarkName({...$event, id: landmark.id, volume: 'incoming'})"
    v-if="landmark">

    <!-- prepend -->
    <template slot="prepend">
      <div class="input-group-prepend">

        <!-- unlink -->
        <div
          v-if="parentLandmark"
          @click="unlink"
          class="btn btn-sm btn-danger">
          <font-awesome-icon icon="unlink"></font-awesome-icon>
        </div>

        <div
          v-else
          @mousedown="dragFlag = true"
          class="input-group-text text-muted drag-handle">
          <font-awesome-icon icon="grip-vertical"></font-awesome-icon>
        </div>

        <!-- uncheck -->
        <div
          @click="toggleLmActive({ volume: 'incoming', id: landmark.id })"
          class="input-group-text">
          <input
            :checked="landmark.active"
            type="checkbox" />
        </div>

        <!-- landmark icon -->
        <span
          @click="gotoLm({ volume: 'incoming', id: landmark.id })"
          v-b-tooltip.hover.left.nofade="landmark.name"
          :style="{color: overlayColorHex, opacity: landmark.active ? 1.0 : inactiveOpacity }"
          class="input-group-text opacity-transition">
          <font-awesome-icon class="icon" icon="map-marker-alt"></font-awesome-icon>
        </span>
        
      </div>
    </template>


    <!-- append -->
    <template slot="append">
      <div class="input-group-append">

        <!-- see more icon -->
        <div
          tabindex="-1"
          :id="'popover-inc-vol-' + landmark.id"
          class="input-group-text readmore-icon">
          <font-awesome-icon icon="ellipsis-v"></font-awesome-icon>
        </div>

        <b-popover
          triggers="click blur"
          :target="'popover-inc-vol-' + landmark.id">
          <template slot="title">Edit Landmark</template>
          <EditLandmarkComponent
            volume="incoming"
            @removeLm="removeLm({ volume: 'incoming', id: landmark.id})"
            @changeName="changeLandmarkName({ ...$event, id: landmark.id, volume: 'incoming' })"
            :landmark="landmark"/>
        </b-popover>
      </div>
    </template>
  </LandmarkRowV2>
  <div
    @dragover="dragOver"
    @drop="dragDrop"
    @dragenter="dragEnter"
    @dragleave="dragLeave"
    :style="dragOverFlag ? {backgroundColor: 'rgba(0, 100, 0, 0.2)'} : {}"
    class="border empty-container" v-else>
    <transition name="fade">
      <span class="parent-name-container" v-if="pairLandmarkStartDragging">
        {{ parentLandmark.name }}
      </span>
    </transition>
    <transition name="fade">
      <span class="bg-secondary parent-name-container" v-if="!pairLandmarkStartDragging">
        Unpaired
      </span>
    </transition>
  </div>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import { INACTIVE_ROW_OPACITY, INCOMING_COLOR, UNPAIRED_COLOR } from '@/constants'
import LandmarkRowV2 from '@/components/LandmarkRowV2'
import EditLandmarkComponent from '@/components/EditLandmark'
export default {
  components: {
    LandmarkRowV2,
    EditLandmarkComponent
  },
  methods: {
    ...mapActions('landmarksStore', [
      'changeLandmarkName',
      'addLmp',
      'gotoLm',
      'removeLm',
      'toggleLmActive',
      'removeLmp'
    ]),
    ...mapMutations('landmarkStore', [
      'setPairLandmarkStartDragging'
    ]),
    unlink: function () {
      this.removeLmp({
        incId: this.landmark.id
      })
    },
    dragStart: function (ev) {
      if (!this.dragFlag) ev.preventDefault()
      this.setPairLandmarkStartDragging({
        pairLandmarkStartDragging: true
      })
      this.dragFlag = false
      this.dragInProgress = true
      ev.dataTransfer.setData('text/plain', this.landmark.id)
    },
    dragEnd: function (ev) {
      this.dragInProgress = false
      this.setPairLandmarkStartDragging({
        pairLandmarkStartDragging: false
      })
    },
    dragDrop: function (ev) {
      const incId = ev.dataTransfer.getData('text')
      this.dragOverFlag = false
      if (!incId || !this.parentLandmark)
        return

      this.addLmp({
        incId,
        refId: this.parentLandmark.id
      })
    },
    dragOver: function (ev) {
      ev.preventDefault()
    },
    dragEnter: function (ev) {
      ev.preventDefault()
      this.dragOverFlag = true
    },
    dragLeave: function () {
      this.dragOverFlag = false
    }
  },
  data: function () {
    return {
      dragInProgress: false,
      dragFlag: false,
      dragOverFlag: false
    }
  },
  props: {
    landmark: {
      type: Object,
      default: null
    },
    parentLandmark: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapState({
      pairLandmarkStartDragging: 'pairLandmarkStartDragging',
      overlayColorHex: function (state) {
        return state._step2Mode === 'classic'
          ? this.landmark.color || UNPAIRED_COLOR
          : state.overlayColor.hex || INCOMING_COLOR
      }
    }),
    inactiveOpacity: function () {
      return INACTIVE_ROW_OPACITY
    }
  }
}
</script>
<style scoped>
.container
{
  transition: linear opacity 0.2s;
  padding: 0;
  flex-wrap: nowrap;
}
.icon
{
  filter: drop-shadow( 0px 1px rgba(0, 0, 0, 0.5))
    drop-shadow(0px -1px rgba(0, 0, 0, 0.5))
    drop-shadow(1px 0px rgba(0, 0, 0, 0.5))
    drop-shadow(-1px 0px rgba(0, 0, 0, 0.5));
}

.opacity-transition
{
  transition: linear all 0.2s;
}

.empty-container
{
  width: 100%;
  height: 100%;
  transition: linear all 0.2s;
  white-space: nowrap;
  overflow:hidden;
  color: rgba(0, 0, 0, 0.5);
  font-size: 80%;
  display: flex;
  align-items: center;
}

.readmore-icon,
.drag-handle
{
  padding-left: 0.2em;
  padding-right: 0.2em;
}


.drag-handle > *,
.readmore-icon > *
{
  opacity: 0.3;
  transition: linear all 0.2s;
}

.drag-handle:hover > *,
.readmore-icon:hover >*
{
  opacity: 1.0;
}

.drag-handle:hover
{
  cursor:move;
}

.parent-name-container
{
  width: 0px;
  pointer-events: none;
  margin-left: 1em;
}

.landmark-name-container
{
  width: 0em;
  overflow: visible;
  white-space: nowrap;
}

</style>
