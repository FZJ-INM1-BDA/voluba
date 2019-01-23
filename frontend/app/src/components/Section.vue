<template>
  <div :id="id">
    <div @click="toggle" class="header">
      <font-awesome-icon icon="caret-right" :class="transformIcon" pull="left"/>
      <span><strong> {{ title }}</strong></span>
      <slot name="header"></slot>
    </div>
    <b-collapse :visible="opened" class="body">
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
    showContent: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    console.log(this.showContent)
    return {
      opened: this.showContent
    }
  },
  methods: {
    toggle: function () {
      this.opened = !this.opened
    }
  },
  computed: {
    transformIcon: function () {
      return this.opened ? 'icon iconVisible' : 'icon iconNotVisible'
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
}
</style>
