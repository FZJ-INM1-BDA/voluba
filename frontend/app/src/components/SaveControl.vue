<template>
  <div>
    <div
      @mousedown="$emit('header-mousedown', $event)"
      class="card bg-light">
      <h5 class="title">
        Save Result
      </h5>
    </div>

    <!-- body -->
    <div class="body bg-light">
      <b-button @click = "saveJson" variant="secondary">
        <font-awesome-icon icon="download"/>
        Save as JSON
      </b-button>
      
      <b-button @click = "exportToHBP" variant="secondary">
        <font-awesome-icon icon="file-export"/>
        Publish on HBP platform
      </b-button>
    </div>
  </div>  
</template>
<script>
export default {
  methods: {
    saveJson: function () {
      console.log('save as json')
    },
    exportToHBP: function () {
      console.log('export to HBP')
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
