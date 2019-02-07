<template>
  <div class="nehubaStatusCardContainer">

    <!-- toggler -->
    <small @click="open = !open" class="toggler">
      <font-awesome-icon :icon="icon" />
    </small>

    <!-- body -->
    <small v-if="open" class="body">
      <slot>
      </slot>
    </small>
  </div>
</template>
<script>
export default {
  props: {
    initOpen: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      open: this.initOpen
    }
  },
  computed: {
    icon: function () {
      return this.open ? 'chevron-down' : 'chevron-up'
    }
  }
}
</script>
<style scoped>
.nehubaStatusCardContainer
{
  display:inline-block;
  flex-direction: column;
  width: 16em;
  background-color:rgba(50, 50, 50, 0.8);
  color: white;

  margin-left: 10em;

  border-radius: 0.4em 0.4em 0 0;
}

.nehubaStatusCardContainer > *
{
  display: block;
}

.toggler
{
  text-align: center;
  transition: all 0.5s;
}

.toggler:hover
{
  background-color: rgba(255, 255, 255, 0.2);
}

.body
{
  padding: 0.2em 0.5em;
}
</style>
