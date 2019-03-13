import { defaultXform, determineElement, patchSliceViewPanel } from '@//constants'
import Vue from 'vue'

export default {
  /**
   * useful so that nehuba objects are not attached getters and setters.
   * likely will affect performance if they do.
   * properties are already reactive via means of subscription
   */
  nehubaBase: {},
  data: function () {
    return {
      nehubaBase__nehubaInitStatus: false,
      nehubaBase__cid: null,
      nehubaBase__subscriptions: [], 
      nehubaBase__appendNehubaFlag: false,
      nehubaBase__navigationPosition: null,
      nehubaBase__dataToViewport: [
        defaultXform,
        defaultXform,
        defaultXform
      ],
      nehubaBase__viewportToDatas: [],
      nehubaBase__mousePosition: null
    }
  },
  mounted() {
    this.$store.subscribeAction(({type}) => {
      if (type === 'redrawNehuba') {
        if ( this.$options && this.$options.nehubaBase && this.$options.nehubaBase.nehubaBase__nehubaViewer ) {
          this.$options.nehubaBase.nehubaBase__nehubaViewer.redraw()
        }
        setTimeout(this.nehubaBase__navigationChanged)
      }
    })
  },
  methods: {
    nehubaBase__viewportToData: function (event) {

      if (this.nehubaBase__viewportToDatas[0] && this.nehubaBase__viewportToDatas[1] && this.nehubaBase__viewportToDatas[2]) {
        return
      }
      const element = event.srcElement || event.originalTarget
      this.nehubaBase__viewportToDatas[determineElement(element)] = event.detail.viewportToData
    },
    nehubaBase__initNehuba: function () {
      /**
       * only change cid. watcher should take care of the rest
       */
      return new Promise((resolve, reject) => {
        if ( !('export_nehuba' in window) ) 
          return reject('export_nehuba is not present in global scope. append nehuba error')
        this.nehubaBase__preInit()
          .then(Vue.nextTick)
          .then(this.nehubaBase__init)
          .then(this.nehubaBase__postInit)
          .then(({ nehubaViewer }) => {
            if (this.$options) {
              if (!this.$options.nehubaBase) {
                this.$options.nehubaBase = {}
              }
              this.$options.nehubaBase.nehubaBase__nehubaViewer = nehubaViewer
            }
            resolve()
          })
          .catch(reject)
      })
    },
    nehubaBase__preInit: function () {

      /**
       * empty promise, keep eventloop busy for one cycle, so that DOM updates
       * also, check all needed data + prereq is met
       */
      return new Promise((resolve, reject) => {
        if (!this.config)
          return reject('nehubaBase: config is not set')
        
        /**
         * set id to neuroglancer-container
         */
        this.nehubaBase__cid = 'neuroglancer-container'

        /**
         * check browser compatibility
         */
        
        return resolve()
      })
    },
    nehubaBase__init: function () {
      return new Promise(resolve => {
        const nehubaViewer = window.export_nehuba.createNehubaViewer(this.config, (err) => {
          console.log('callback error', err)
        })
        
        this.nehubaBase__subscriptions.push(
          nehubaViewer.navigationState.full.subscribe(this.nehubaBase__navigationChanged)
        )
        this.nehubaBase__subscriptions.push(
          nehubaViewer.navigationState.position.inRealSpace
            .subscribe(fa => {
              this.nehubaBase__navigationPosition = Array.from(fa)
            })
        )
        this.nehubaBase__subscriptions.push(
          nehubaViewer.mousePosition.inRealSpace.subscribe(fa => {
            if (fa)
              this.nehubaBase__mousePosition = Array.from(fa)
          })
        )

        /**
         * patch nehuba slice view draw
         */
        setTimeout(() => {
          nehubaViewer.ngviewer.display.panels.forEach(patchSliceViewPanel)
        })

        resolve({ nehubaViewer })
      })
    },
    nehubaBase__postInit: function (obj) {
      return new Promise(resolve => {
        this.nehubaBase__nehubaInitStatus = true
        this.nehubaBase__cid = null
        resolve(obj)
      })
    },
    nehubaBase__destroyNehuba: function () {
      return new Promise((resolve, reject) => {
        this.nehubaBase__nehubaBaseDestroyHook()
        if (this.$options && this.$options.nehubaBase) {
          if (this.$options.nehubaBase.nehubaBase__nehubaViewer) {
            this.$options.nehubaBase.nehubaBase__nehubaViewer.dispose()
            this.$options.nehubaBase.nehubaBase__nehubaViewer = null
          }
        }
        resolve()
      })
    },
    nehubaBase__nehubaBaseDestroyHook: function () {
      this.nehubaBase__dataToViewport = [
        defaultXform,
        defaultXform,
        defaultXform
      ],
      this.nehubaBase__subscriptions.forEach(s => s.unsubscribe())
    },
    nehubaBase__navigationChanged: function () {
      /**
       * by default nothing happens. to be overwritten by subclasses
       */
    },
    nehubaBase__sliceRenderEvent: function (event) {
      if (
        this.nehubaBase__dataToViewport[0] !== defaultXform &&
        this.nehubaBase__dataToViewport[1] !== defaultXform &&
        this.nehubaBase__dataToViewport[2] !== defaultXform
      ) {
        return
      }

      const element = event.srcElement || event.originalTarget
      this.nehubaBase__dataToViewport[determineElement(element)] = event.detail.nanometersToOffsetPixels

      if (
        this.nehubaBase__dataToViewport[0] !== defaultXform &&
        this.nehubaBase__dataToViewport[1] !== defaultXform &&
        this.nehubaBase__dataToViewport[2] !== defaultXform
      ) {
        this.nehubaBase__navigationChanged()
      }
    }
  }
}