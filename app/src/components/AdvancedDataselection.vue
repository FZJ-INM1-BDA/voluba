<template>
  <div>
    <label for="tmplInput">Template URL:</label>
    <b-input
      v-model="tmplModel"
      id="tmplInput"
      type="text"
      :placeholder="templatePlaceHolder"/>
    
    <div class="alert alert-success" v-if="tmplCleared">
      Looks good!
    </div>
    <div class="alert alert-danger" v-if="tmplCheckError">
      <span>{{ tmplCheckError }}</span>
    </div>

    <label for="incInput">Incoming URL:</label>
    <b-input
      v-model="incModel"
      id="incInput"
      type="text"
      :placeholder="incomingPlaceHolder"/>

    <div class="alert alert-success" v-if="incCleared">
      Looks good!
    </div>
    <div class="alert alert-danger" v-if="incCheckError">
      <span>{{ incCheckError }}</span>
    </div>

  </div>
</template>

<script>
import { mapActions } from "vuex"
const DEBOUNCE_TIME = 500

function getDebounced(timeout){
  let ref
  return function debounce(cb){
    if (ref) {
      clearTimeout(ref)
      ref = null
    }
    ref = setTimeout(() => {
      cb()
      ref = null
    }, timeout);
  }
}

function checkUrl(url){
  /**
   * not sure if I can use async await.
   * to be safe, I will use promise instead
   */
  return new Promise((rs, rj) => {
    if (!/^precomputed:\/\//.test(url)) {
      return rj(`precomputed source must start with precomputed://`)
    }
    const precompUrl = url.replace(/^precomputed:\/\//, '')
    if (!/^https?:\/\//.test(precompUrl)) {
      return rj(`url must start with http:// or https://`)
    }
    fetch(`${precompUrl}/info`)
      .then(rs)
      .catch(rj)
  })
}


export default {
  data: function() {
    return {
      templatePlaceHolder: "precomputed://https://src.foo/bar",
      incomingPlaceHolder: "precomputed://https://incoming.volume/foo",
      
      tmplDebRef: null,
      incFetchRef: null,

      tmplModel: null,
      incModel: null,

      tmplCleared: false,
      incCleared: false,

      checkTmplUrl: getDebounced(DEBOUNCE_TIME),
      checkIncUrl: getDebounced(DEBOUNCE_TIME),

      tmplCheckError: null,
      incCheckError: null,
    }
  },
  computed: {
    bothCleared() {
      return this.incCleared
    }
  },
  watch: {
    tmplModel: function (curr, _prev) {
      this.tmplCleared = false
      this.tmplCheckError = null

      this.checkTmplUrl(() => {
        checkUrl(curr)
          .then(res => {
            console.log('res', res)
            this.tmplCleared = true
          })
          .catch(e => this.tmplCheckError = e.toString())
      })
    },
    incModel: function (curr, _prev) {
      this.incCleared = false
      this.incCheckError = null

      this.checkIncUrl(() => {
        checkUrl(curr)
          .then(() => {
            this.incCleared = true
            this.appendToIncomingVolumes({
              volumes: [{
                name: curr,
                imageSource: curr,
                dim: [2, 2, 2],
                id: curr
              }]
            })
          })
          .then(() => {
            this.selectIncomingVolumeWithId(curr)
          })
          .catch(e => {
            console.log(e)
            this.incCheckError = e.toString()
          })
      })
    }
  },
  methods: {
    resetClearance() {

    },
    setClearance() {

    },
    
    ...mapActions('dataSelectionStore', [
      "selectIncomingVolumeWithId",
      'appendToIncomingVolumes'
    ]),
  },
  beforeDestroy: function() {
    
  }
}
</script>