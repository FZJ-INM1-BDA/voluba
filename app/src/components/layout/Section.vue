<template>
  <div
    class="container"
    :id="id">
    <div
      @click="toggle"
      class="header">
      <font-awesome-icon
        icon="caret-right"
        :class="transformIcon"
        pull="left"/>
      <span><strong> {{ title }}</strong></span>
      <slot name="header"></slot>
    </div>
    <b-collapse :id = "id + '-body'" :visible="opened" class="body">
      <slot name="body"></slot>
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: 'SectionComponent',
  props: {
    id: String,
    title: String,
    forceHide: {
      type: Boolean,
      default: false
    },
    showContent: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      opened: this.showContent
    }
  },
  methods: {
    toggle: function () {
      if (this.forceHide) return
      this.opened = !this.opened
    }
  },
  computed: {
    transformIcon: function () {
      return this.opened ? 'icon iconVisible' : 'icon iconNotVisible'
    }
  },
  watch:{
    forceHide: function (flag) {
      if (flag) {
        this.opened = false
      }
    }
  }
}
</script>
<style scoped>
.header:hover
{
  cursor: default;
}

.header
{
  position: relative;
  user-select: none;
  display: flex;
  align-items: center;
}

.header > *
{
  flex: 0 0 auto;
}

.header:after
{
  position: absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  content: ' ';
  z-index:9999;
  display:block;
  background-color:rgba(128, 128, 128, 0.2);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms linear;
}

.header:hover:after
{
  opacity: 0.5;
}

.icon
{
  transition: transform 180ms linear;
}

.icon.iconVisible
{
  transform: rotate(90deg);
}

.body
{
  padding-left: 11px;
  margin-top: 5px;
}

.container
{
  width: 100%;
}
</style>
