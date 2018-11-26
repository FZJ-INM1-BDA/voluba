<template>
  <b-card no-body>
    <b-card-header @click = "toggle" header-tag="header" role="tab">
      <font-awesome-icon :class = "transformArrow" icon = "angle-right" pull="left" />
      <!-- content transclusion with <template slot = "hearder"></template> -->
      <slot name = "header"></slot>
    </b-card-header>
    <b-collapse :id="id" :visible="actualVis">
      <b-card-body>
        <!-- content transclusion with <template slot = "body"></template> -->
        <slot name = "body">
        </slot>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script>
export default {
  name: 'CardComponent',
  props: {
    id: String,
    initialVisibility: Boolean
  },
  data: function () {
    return {
      visibility: null
    }
  },
  methods: {
    toggle: function () {
      this.visibility = !this.actualVis
    }
  },
  computed: {
    actualVis: function () {
      return this.visibility === null
        ? this.initialVisibility
        : this.visibility
    },
    transformArrow: function () {
      return this.actualVis
        ? 'arrow arrowVisible'
        : 'arrow arrowNotVisible'
    }
  }
}
</script>
<style scoped>
header:hover
{
  cursor: default;
}

header
{
  position: relative;
  user-select: none;
}

header:after
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

header:hover:after
{
  opacity: 0.5;
}

.arrow
{
  transition: transform 180ms linear;
}

.arrow.arrowVisible
{
  transform: rotate(90deg);
}

</style>
