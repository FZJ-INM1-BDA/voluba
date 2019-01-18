<template>
  <table class="table">
    <thead>
      <tr>
        <th><input type="checkbox" v-model="checkAll" /></th>
        <th>Color</th>
        <th>Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <LandmarkRow
        :id = "lm.id"
        :active = "lm.active"
        :visible = "lm.visible"
        :name = "lm.name"
        :key = "lm.id"
        v-for = "lm in landmarks"
        :color = "lm.color" />
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
      checkAll: false,
      color: '#FCDC00'
    }
  },
  watch: {
    checkAll: function () {
      this.checkAllPairs()
    }
  },
  components: {
    LandmarkRow
  },
  methods: {
    checkAllPairs: function () {
      this.$store.dispatch('enableLandmarkPairs', { enable: this.checkAll })
    },
  },
  computed: {
    landmarks: function () {
      /**
       * expect landmarks to be [{id: UNIQUE_ID, name: NAME, color: HEX}]
       */

      // eslint-disable-next-line
      const { referenceLandmarks, incomingLandmarks, landmarkPairs } = this.$store.state
      return landmarkPairs
    }
  }
}
</script>

<style scoped>
</style>
