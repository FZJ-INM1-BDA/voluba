<template>
  <linearGradient
    :id="id"
    :x1="x1"
    :y1="y1"
    :x2="x2"
    :y2="y2">

    <stop
      :stop-color="color"
      stop-opacity="1.0"
      offset="0%"/>
    <stop
      :stop-color="color"
      stop-opacity="0.8"
      offset="30%"/>
    <stop
      :stop-color="color"
      stop-opacity="0.3"
      offset="70%"/>
    <stop
      :stop-color="color"
      stop-opacity="0.3"
      offset="80%"/>
  </linearGradient>
</template>
<script>
export default {
  props: {
    color: {
      type: String,
      default: 'black'
    },
    id: {
      type: String,
      default: null
    },
    x1: {
      type: String | Number,
      default: '0'
    },
    y1: {
      type: String | Number,
      default: '0'
    },
    x2: {
      type: String | Number,
      default: '0'
    },
    y2: {
      type: String | Number,
      default: '0'
    }
  }
}
</script>