<template>
  <div
    :style="styleLandmark"
    class="icon-container">
    <div
      :id="'lm-icon-' + _uid"
      @mousedown="mousedownOnIcon"
      :style="iconStyle" class="icon"
      v-b-tooltip="tooltipObj">
      <font-awesome-icon :icon="icon"/>
    </div>
    <div :style="stalkStyle" class="stalk"/>
    
  </div>
</template>
<script>
import EditLandmarkComponent from '@/components/EditLandmark'

const zOffsetThreshold = -4

export default {
  components: {
    EditLandmarkComponent
  },
  props: {
    landmark: {
      type: Object,
      default: null
    },
    active: {
      type: Boolean,
      default: true
    },
    tooltipText: {
      type: String,
      default: null
    },
    zOffset: {
      type: Number,
      default: zOffsetThreshold + 1
    },
    overwriteStyle: {
      type: Object,
      default: function() {
        return {};
      }
    },
    color: {
      type: String | Object,
      default: function() {
        return "yellow";
      }
    }
  },
  methods: {
    mousedownOnIcon: function() {
      this.$emit("mousedownOnIcon");
    }
  },
  computed: {
    tooltipObj: function() {
      return this.tooltipText && !this.active
        ? {}
        : {
            title: this.tooltipText,
            trigger: "hover",
            placement: this.zOffset > zOffsetThreshold ? "top" : "bottom"
          };
    },
    tooltipPlacement: function() {
      return "bottom";
    },
    styleLandmark: function() {
      return {
        opacity: this.active
          ? this.zOffset >= zOffsetThreshold
            ? "1.0"
            : "0.5"
          : "0.05",
        color: this.color
      };
    },
    icon: function() {
      return this.zOffset >= zOffsetThreshold ? "map-marker-alt" : "anchor";
    },
    iconStyle: function() {
      return {
        transform: `translateY(${-this.zOffset}px)`,
        pointerEvents: this.tooltipText ? "all" : "none"
      };
    },
    stalkStyle: function() {
      return {
        backgroundColor: this.color,
        height: `${Math.abs(this.zOffset)}px`,
        marginTop:
          this.zOffset >= zOffsetThreshold ? `${-this.zOffset}px` : `0px`
      };
    }
  }
};
</script>
<style scoped>
.icon-container {
  pointer-events: all;
  width: 0px;
  height: 0px;
  overflow: visible;
  position: relative;
}
.icon {
  pointer-events: all;
  width: 1em;
  height: 1em;
  margin-left: -0.5em;
  margin-top: -1em;
  filter: drop-shadow(0 0 0.2em black);
  position: absolute;
  left: 0;
  top: 0;
}

/* .icon:hover
{
  cursor: move
} */

.icon > * {
  width: 1em;
  height: 1em;
}
.stalk {
  width: 1px;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.5);
  position: absolute;
  left: 0;
  top: 0;
}

* {
  transition: linear opacity 0.2s;
}
</style>
