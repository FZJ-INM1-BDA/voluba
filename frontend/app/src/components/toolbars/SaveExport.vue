<template>
  <b-card-body class = "save-export-container">
    <b-button @click = "saveJson" variant="secondary">
      <font-awesome-icon icon="download"/>
      Save as JSON
    </b-button>
    <!-- <br><br> -->
    <b-button @click = "exportToHBP" variant="secondary">
      <font-awesome-icon icon="file-export"/>
      Publish on HBP platform
    </b-button>
  </b-card-body>
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

<style>
.save-export-container
{
  background-color:white;
}
</style>
