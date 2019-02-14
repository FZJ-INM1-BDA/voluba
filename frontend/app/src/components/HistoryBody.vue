<template>
  <div>
    <!-- title -->
    <div
      @mousedown="$emit('header-mousedown', $event)"
      class="card bg-light">
      <h5 class="title">
        <div>
          History
        </div>
        <small>
          Time Machine
        </small>
      </h5>
    </div>

    <!-- body -->
    <div class="card card-body bg-light">

      <!-- control btns -->
      <div class="btn-container mb-2">
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
          :key="redo.id"
          v-for="redo in redoStack"
          class="alert alert-secondary mb-0">
          redo: {{ redo.name }}
        </div>
      </div>

      <!-- undo -->
      <div class="history-container undos">
        <div v-if="moreUndo" class="alert alert-primary text-muted mb-0">
          {{ moreUndo }}
        </div>
        <div
          :key="undo.id"
          v-for="undo in undoStack"
          class="alert alert-primary mb-0">
          undo: {{ undo.name }}
        </div>
      </div>
    </div>
  </div>  
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  methods: {
    ...mapActions({
      undo: 'undo',
      redo: 'redo'
    })
  },
  computed: {
    ...mapState({
      undoStack: state => state.undoStack.slice(-5),
      redoStack: state => state.redoStack.slice(-5),
      moreUndo: state => state.undoStack.length > 5 ? `${state.undoStack.length - 5} more undo item${state.undoStack.length - 5 > 1 ? 's' : ''}` : null,
      moreRedo: state => state.redoStack.length > 5 ? `${state.redoStack.length - 5} more redo item${state.redoStack.length - 5 > 1 ? 's' : ''}` : null
    }),
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
.history-container
{
  display: flex;
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
</style>
