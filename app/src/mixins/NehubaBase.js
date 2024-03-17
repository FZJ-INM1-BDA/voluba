import { patchSliceViewPanel, convertVoxelToNm } from '@//constants'
import { mapActions, mapState } from "vuex";
import Vue from 'vue'

export default {
  /**
   * NB do not uncomment
   * somehow shares base mixin class across all instances
   */
  // nehubaBase: {},
  data: function () {
    return {
      nehubaBase__nehubaInitStatus: false,
      nehubaBase__cid: null,
      nehubaBase__subscriptions: [], 
      nehubaBase__appendNehubaFlag: false,
      nehubaBase__navigationPosition: null,
      nehubaBase__navigationOrientation: null,
      // need to use a set, because we need to iterate to get the elements
      // better idea to use the set to capture viewport elements, than to capture sliceviews
      nehubaBase__viewportElements: new Set(),
      nehubaBase__dataToViewportWeakMap: new WeakMap(),
      nehubaBase__elementToSliceViewWeakMap: new WeakMap(),
      nehubaBase__mousePosition: null,
      nehubaBase__mousePositionVoxel: null,
      nehubaBase__additionalConfig: null,
    }
  },
  mounted() {
    this.$store.subscribeAction(({ type }) => {
      if (type === 'nehubaStore/redrawNehuba') {
        if ( this.$options && this.$options.nehubaBase && this.$options.nehubaBase.nehubaBase__nehubaViewer ) {
          this.$options.nehubaBase.nehubaBase__nehubaViewer.redraw()
        }
        setTimeout(this.nehubaBase__navigationChanged)
      }
    })
  },
  methods: {
    ...mapActions('dataSelectionStore', [
      'setViewerCoordinateSpace'
    ]),
    nehubaBase__viewportToData: function (event) {
      const { sliceView } = event.detail || {}
      const element = event.srcElement || event.originalTarget
      if (!element || !sliceView) return

      this.nehubaBase__elementToSliceViewWeakMap.set(element, sliceView)
    },
    nehubaBase__initNehuba: function (additionalConfig) {
      if (additionalConfig)
        this.nehubaBase__additionalConfig = additionalConfig
      const _this = this
      return new Promise((resolve, reject) => {
        if ( !('export_nehuba' in window) ) 
          return reject('export_nehuba is not present in global scope. append nehuba error')
        this.nehubaBase__preInit()
          .then(Vue.nextTick)
          .then(this.nehubaBase__init)
          .then(this.nehubaBase__postInit)
          .then(({ nehubaViewer }) => {
            if (_this.$options) {
              if (!_this.$options.nehubaBase) {
                _this.$options.nehubaBase = {}
              }
              _this.$options.nehubaBase.nehubaBase__nehubaViewer = nehubaViewer
            }
            resolve()
          })
          .catch(e => {
            console.warn('nehubaBase__initNehuba error:', e)
            reject(e)
          })
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

        const config = { ...this.config }

        if (this.nehubaBase__additionalConfig) {
          const { orientation, perspectiveZoom, perspectiveOrientation, zoom, position } = this.nehubaBase__additionalConfig
          const initialNgState = config.dataset.initialNgState
          
          if (!initialNgState.navigation) 
            initialNgState.navigation = {}
          if (!initialNgState.navigation.pose)
            initialNgState.navigation.pose = {}

          initialNgState.navigation.pose.orientation = orientation
          initialNgState.navigation.pose.position = {
            voxelSize: [1, 1, 1],
            voxelCoordinates: position
          }
          initialNgState.navigation.zoomFactor = zoom
          initialNgState.perspectiveOrientation = perspectiveOrientation
          initialNgState.perspectiveZoom = perspectiveZoom
        }
        const nehubaViewer = window.export_nehuba.createNehubaViewer(config, (err) => {
          if (this.log && this.log instanceof Function)
            this.log(['nehubaBase__init#createNehubaViewer#Callback', {error: err}])
        })

        nehubaViewer.ngviewer.coordinateSpace.changed.add(() => {
          this.setViewerCoordinateSpace({
            coordinateSpace: nehubaViewer.ngviewer.coordinateSpace.toJSON()
          })
        })
        
        this.nehubaBase__subscriptions.push(
          nehubaViewer.navigationState.full.subscribe(this.nehubaBase__navigationChanged)
        )
        this.nehubaBase__subscriptions.push(
          nehubaViewer.navigationState.position.inVoxels
            .subscribe(posVoxel => {
              try {
                this.nehubaBase__navigationPosition = convertVoxelToNm(this.coordinateSpace, posVoxel, "vec3")
              } catch (e) {

              }
            })
        )
        this.nehubaBase__subscriptions.push(
          nehubaViewer.navigationState.orientation
            .subscribe(fa => {
              try {
                this.nehubaBase__navigationOrientation = Array.from(fa)
              } catch (e) {

              }
            })
        )

        this.nehubaBase__subscriptions.push(
          nehubaViewer.mousePosition.inVoxels.subscribe(mouseVoxels => {
            if (!mouseVoxels) {
              this.nehubaBase__mousePosition = null
              this.nehubaBase__mousePositionVoxel = null
              return
            }
            this.nehubaBase__mousePositionVoxel = Array.from(mouseVoxels)
            this.nehubaBase__mousePosition = convertVoxelToNm(this.coordinateSpace, mouseVoxels, "vec3")
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
      return new Promise(resolve => {
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
      this.nehubaBase__viewportElements.clear()
      this.nehubaBase__subscriptions.forEach(s => s.unsubscribe())
    },
    nehubaBase__navigationChanged: function () {
      /**
       * by default nothing happens. to be overwritten by subclasses
       */
    },
    nehubaBase__sliceRenderEvent: function (event) {
      const element = event.srcElement || event.originalTarget
      if (!element || !event.detail.nanometersToOffsetPixels) {
        return
      }
      // N.B. needs reassignment
      const s = new Set(this.nehubaBase__viewportElements)
      s.add(element)
      this.nehubaBase__viewportElements = s
      
      this.nehubaBase__dataToViewportWeakMap.set(element, event.detail.nanometersToOffsetPixels)
      this.nehubaBase__navigationChanged()
    },
    nehubaBase__setOrientation: function(orientation){    
      this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.navigationState.pose.orientation.restoreState( orientation )
    }
  },
  computed: {
    ...mapState('dataSelectionStore',[
      'coordinateSpace',
    ]),
  }
}