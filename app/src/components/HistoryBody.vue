<template>
  <div class="bg-light">
    <!-- title -->
    <div
      @mousedown="$emit('header-mousedown', $event)"
      class="card title-container pl-3">
      <div class="icon">
        <div
          @click="$emit('close')"
          class="rounded-circle btn btn-sm btn-outline-secondary">
          <font-awesome-icon icon="times"/>
        </div>
      </div>
      <h5 class="title">
        <div>
          {{ historyBrowserTitle }}
        </div>
      </h5>
    </div>

    <!-- body -->
    <div class="card card-body bg-light">

      <!-- control btns -->
      <div class="btn-container mb-2">

        <!-- start from scratch btn -->
        <div
          class="horizontalContainer flex-items">
          <div
            @click="openModal({ modalId: 'startFromScratchModal' })"
            class="rounded-circle btn-lg btn btn-danger"
            v-b-tooltip.top.hover
            title="Start from scratch">
            <font-awesome-icon icon="backward" />
          </div>
        </div>
        
        <div v-b-tooltip.top.hover="undoText">
          <div
            @click="undo"
            :class="undoStack.length > 0 ? '' : 'disabled'"
            class="rounded-circle btn-lg btn btn-light">
            <font-awesome-icon icon="undo" />
          </div>
        </div>

        <div v-b-tooltip.top.hover="redoText">
          <div
            @click="redo"
            :class="redoStack.length > 0 ? '' : 'disabled'"
            class="rounded-circle btn-lg btn btn-light">
            <font-awesome-icon icon="redo" />
          </div>
        </div>
      </div>

      <!-- redo -->
      <div class = "history-container redos">
        <div v-if="moreRedo" class="alert alert-secondary text-muted mb-0">
          {{ moreRedo }}
        </div>
        <div
          @click="clickRedo(redo)"
          :key="redo.id"
          v-for="redo in redoStack"
          class="alert alert-secondary mb-0">
          {{ redo.name }}
        </div>
      </div>

      <!-- undo -->
      <div class="history-container undos">
        <div v-if="moreUndo" class="alert alert-primary text-muted mb-0">
          {{ moreUndo }}
        </div>
        <div
          @click="clickUndo(undo)"
          :key="undo.id"
          v-for="(undo, idx) in undoStack"
          class="alert alert-primary mb-0">
          <small v-if="idx === undoStack.length - 1" class="text-muted">
            current:
          </small>
          {{ undo.name }}
        </div>
      </div>
    </div>
  </div>  
</template>
<script>
import { mapState, mapActions } from 'vuex'

import { HISTORY_BROWSER_TITLE } from '@/text'

export default {
  methods: {
    ...mapActions({
      openModal: 'openModal',
      log: 'log'
    }),
    ...mapActions('undoStore', [
      'undo',
      'redo'
    ]),
    clickUndo: function (undo) {
      this.log(undo)
    },
    clickRedo: function (redo) {
      this.log(redo)
    }
  },
  computed: {
    ...mapState('undoStore', {
      storeUndoStack: state => state.undoStack,
      storeRedoStack: state => state.redoStack
    }),
    undoStack: function () {
      return this.storeUndoStack.slice(-5)
    },
    redoStack: function () {
      return this.storeRedoStack.slice(-5)
    },
    moreUndo: function () {
      return this.storeUndoStack.length > 5 ? `${this.storeUndoStack.length - 5} more undo item${this.storeUndoStack.length - 5 > 1 ? 's' : ''}` : null
    },
    moreRedo: function () {
      return this.storeRedoStack.length > 5 ? `${this.storeRedoStack.length - 5} more undo item${this.storeRedoStack.length - 5 > 1 ? 's' : ''}` : null
    },
    historyBrowserTitle: function () {
      return HISTORY_BROWSER_TITLE
    },
    undoText: function () {
      return this.undoStack.length > 0
        ? `undo`
        : `no actions to undo`
    },
    redoText: function () {
      return this.redoStack.length > 0
        ? `redo`
        : `no actions to redo`
    }
  },
}
</script>
<style scoped>

.title
{
  padding-left: 0.5em;
  padding-right: 1.5em;
  padding-top: 0.5em;
  padding-bottom:0.5em;
  margin-bottom:0;

  transition: linear 150ms all;
}
.history-container
{
  display: flex;
  overflow: hidden;
}
.history-container.undos
{
  flex-direction: column-reverse;
}
.history-container.redos
{
  flex-direction: column;
}
.history-container > *
{
  flex: 0 0 1em;
  white-space: nowrap;
  padding: 0.2em 0.5em;
}
.btn-container
{
  display:flex;
  flex-direction: row;
}
.btn-container > *
{
  display: inline-block;
}
.title-container
{
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-container:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
}

</style>
