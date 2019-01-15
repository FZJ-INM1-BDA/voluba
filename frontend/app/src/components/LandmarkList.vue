<template>
  <table class="table">
    <thead>
      <tr>
        <th><input type="checkbox" id="check-all" /></th>
        <th>Color</th>
        <th>Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <LandmarkRow
        :name = "landmark.name"
        :key = "landmark.id"
        v-for = "landmark in landmarks"
        :color = "landmark.color" />
    </tbody>
  </table>
</template>

<script>
import LandmarkRow from '@/components/Landmark'

export default {
  name: 'LandmarkList',
  props: {},
  data: function () {
    return {
      color: '#FCDC00'
    }
  },
  components: {
    LandmarkRow
  },
  methods: {},
  computed: {
    landmarks: function () {

      /**
       * expect landarmks to be [{id: UNIQUE_ID, name: NAME, color: HEX}]
       */

      const { referenceLandmarks, incomingLandmarks, pairs } = this.$store.state
      return pairs.map(pair => {
        return {
          id: referenceLandmarks[pair[0]].id + '_' + incomingLandmarks[pair[1]].id,
          name: referenceLandmarks[pair[0]].name + ' ' + incomingLandmarks[pair[1]].name,
          color: this.color
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
