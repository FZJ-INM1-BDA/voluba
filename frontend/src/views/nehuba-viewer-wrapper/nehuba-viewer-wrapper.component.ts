import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { ReplaySubject, Subject, distinctUntilChanged, fromEvent, map, merge, scan, shareReplay, takeUntil } from 'rxjs';
import { FloatArrayEql, isHtmlElement, Mat4, PatchedSymbol } from 'src/const';
import { DestroyDirective } from 'src/util/destroy.directive';


export type NehubaLayer = {
  id: string
  url: string
  transform: Mat4
}

export type NehubaNavigation = {
  position: Float32Array
  orientation: Float32Array
  zoom: number
}

const lightmode = {
  globals: {
    hideNullImageValues: true,
    useNehubaLayout: {
      keepDefaultLayouts: false,
    },
    useNehubaMeshLayer: true,
    rightClickWithCtrlGlobal: false,
    zoomWithoutCtrlGlobal: false,
    useCustomSegmentColors: true,
  },
  zoomWithoutCtrl: true,
  hideNeuroglancerUI: true,
  rightClickWithCtrl: true,
  rotateAtViewCentre: true,
  enableMeshLoadingControl: true,
  zoomAtViewCentre: true,
  disableSegmentSelection: true,
  dataset: {
    imageBackground: [1, 1, 1, 1],
    initialNgState: {
      showDefaultAnnotations: true,
      layers: {
        // populated by the component
      },
      perspectiveOrientation: [
        0.3140767216682434, -0.7418519854545593, 0.4988985061645508, -0.3195493221282959,
      ],
      perspectiveZoom: 1922235.5293810747,
      navigation: {
        zoomFactor: 350000,
        pose: {
          position: {
            voxelCoordinates: [0, 0, 0]
          },
        }
      },
    },
  },
  layout: {
    views: 'hbp-neuro',
    planarSlicesBackground: [1, 1, 1, 0],
    useNehubaPerspective: {
      enableShiftDrag: false,
      doNotRestrictUserNavigation: true,
      perspectiveSlicesBackground: [1, 1, 1, 1],
      removePerspectiveSlicesBackground: {
        color: [1, 1, 1, 1],
        mode: '==',
      },
      perspectiveBackground: [1, 1, 1, 1],
      fixedZoomPerspectiveSlices: {
        sliceViewportWidth: 300,
        sliceViewportHeight: 300,
        sliceZoom: 63818.3562426177,
        sliceViewportSizeMultiplier: 1,
      },
      mesh: {
        backFaceColor: [1, 1, 1, 1],
        removeBasedOnNavigation: true,
        flipRemovedOctant: true,
      },
      // "centerToOrigin": true,
      // "drawSubstrates": {
      //   "color": [
      //     0,
      //     0,
      //     0.5,
      //     0.15
      //   ]
      // },
      drawZoomLevels: {
        cutOff: 20,
        color: [0.5, 0, 0, 0.15],
      },
      hideImages: false,
      waitForMesh: false,
      // restrictZoomLevel: {
      //   minZoom: 1200000 * 0.002,
      //   maxZoom: 3500000 * 0.002,
      // },
    },
  },
};

const darkmode = {
  ...lightmode,
  dataset: {
    ...lightmode.dataset,
    imageBackground: [0.2, 0.2, 0.2, 1]
  },
  layout: {
    ...lightmode.layout,
    planarSlicesBackground: [0, 0, 0, 0],
  }
}

const _config = darkmode

type LayerProperties = {
  transform: export_nehuba.mat4
  visible: boolean
};

@Component({
  selector: 'voluba-nehuba-viewer-wrapper',
  templateUrl: './nehuba-viewer-wrapper.component.html',
  styleUrls: ['./nehuba-viewer-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'nehubaViewerWrapper',
  hostDirectives: [
    DestroyDirective
  ]
})
export class NehubaViewerWrapperComponent implements OnInit, AfterViewInit {

  #destroyed$ = inject(DestroyDirective).destroyed$

  @Input('nehuba-viewer-alias')
  nehubaAlias: string = 'nehubaViewer'

  @Input('nehuba-viewer-layers')
  layers: NehubaLayer[] = []

  @Input('nehuba-viewer-init-navigation')
  initNavigation: NehubaNavigation|null = null

  @Output()
  mousePosition = new EventEmitter<Float32Array>()

  @Output()
  navigation = new EventEmitter<NehubaNavigation>()

  @Output()
  mousedownSliceView = new EventEmitter<{
    sliceView: export_nehuba.SliceView | null | undefined;
    event: MouseEvent;
  }>();

  nehubaViewer: export_nehuba.NehubaViewer | null = null;
  elementToSliceViewWeakMap = new WeakMap<
    HTMLElement,
    export_nehuba.SliceView
  >();
  #patchedSliceViewPanels = new WeakSet<export_nehuba.SliceViewPanel>();

  constructor(
    private el: ElementRef,
  ) {}

  ngOnInit() {
    if (!(export_nehuba as any)[PatchedSymbol]) {
      (export_nehuba as any)[PatchedSymbol] = true;

      const { UrlHashBinding } = export_nehuba.getNgPatchableObj();
      UrlHashBinding.prototype.setUrlHash = () => {
        // console.log('seturl hash')
        // console.log('setting url hash')
      };
      UrlHashBinding.prototype.updateFromUrlHash = () => {
        // console.log('update hash binding')
      };
    }

    const config = JSON.parse(JSON.stringify(_config));
    config.dataset.initialNgState.layers = {};
    for (const layer of this.layers) {
      config.dataset.initialNgState.layers[layer.id] = {
        source: layer.url,
        transform: layer.transform,
      };
    }
    if (this.initNavigation) {
      config.dataset.initialNgState.navigation.pose.position.voxelCoordinates = Array.from(this.initNavigation.position)
      config.dataset.initialNgState.navigation.zoomFactor = this.initNavigation.zoom
      config.dataset.initialNgState.navigation.pose.orientation = Array.from(this.initNavigation.orientation)
    }
    
    this.nehubaViewer = export_nehuba.createNehubaViewer(config, console.error)

    /**
     * vacate id neuroglancer-container so other containers can be inst
     */
    const el: HTMLElement = this.el.nativeElement.querySelector('#neuroglancer-container')
    el.id = this.nehubaAlias

    const subscription = this.nehubaViewer.mousePosition.inVoxels.subscribe(val => {
      this.mousePosition.emit(val)
    })

    const posSubject = new Subject<NehubaNavigation>()
    const navSub = this.nehubaViewer.navigationState.all.subscribe(val => {
      posSubject.next({
        position: val.position,
        orientation: val.orientation,
        zoom: val.zoom,
      })
    })
    posSubject.pipe(
      distinctUntilChanged((o, n) => (
        FloatArrayEql(o.orientation, n.orientation)
        && FloatArrayEql(o.position, n.position)
        && o.zoom === n.zoom
      )),
      takeUntil(this.#destroyed$)
    ).subscribe(nav => {
      this.navigation.next(nav)
    })

    this.#destroyed$.subscribe(() => {
      (window as any)[this.nehubaAlias] = null
      subscription.unsubscribe()
      navSub.unsubscribe()
    })
    
    this.#patchNehuba();
    (window as any)[this.nehubaAlias] = this.nehubaViewer
  }

  ngAfterViewInit(): void {
    merge(
      fromEvent<MouseEvent>(this.el.nativeElement, 'mousedown', {
        capture: true,
      }).pipe(
        map((ev) => {
          return {
            sliceView: isHtmlElement(ev.target)
              ? this.elementToSliceViewWeakMap.get(ev.target)
              : null,
            event: ev,
          };
        })
      ),
      fromEvent<MouseEvent>(this.el.nativeElement, 'mouseup', {
        capture: true,
      }).pipe(map((ev) => ({ event: ev, sliceView: null })))
    ).pipe(
      distinctUntilChanged((o, n) => o === n || o?.sliceView === n?.sliceView),
      takeUntil(this.#destroyed$),
    ).subscribe((v) => this.mousedownSliceView.emit(v));

  }

  private sliceViewsSubject$ = new ReplaySubject<{
    idx: number,
    sliceView: export_nehuba.SliceView
  }>(3)

  sliceViews$ = this.sliceViewsSubject$.pipe(
    scan((acc, curr) => {
      const returnVal = [...acc]
      returnVal[curr.idx] = curr.sliceView
      return returnVal
    }, [null, null, null] as (export_nehuba.SliceView | null)[]),
    shareReplay(1),
  )

  #patchNehuba() {
    if (!this.nehubaViewer) return

    /**
     * n.b.
     * There is a small chance that the reality may have drifted when
     * boundingclientrect is called and when sliceview elements are measured
     * 
     */
    const { top, left } = this.el.nativeElement.getBoundingClientRect()

    const determineIdx = (el: HTMLElement) => {
      const child = el.getBoundingClientRect()
      const rLeft = child.left - left
      const rTop = child.top - top
      if (rLeft < 5 && rTop < 5) {
        return 0
      }
      if (rLeft > 5 && rTop < 5) {
        return 1
      }
      if (rLeft < 5 && rTop > 5) {
        return 2
      }
      throw new Error(`rLeft ${rLeft} rTop ${rTop} is unexpected`)
    }

    const patchSliceViewPanel = (
      sliceViewPanel: export_nehuba.SliceViewPanel
    ) => {
      if (this.#patchedSliceViewPanels.has(sliceViewPanel)) return;
      const { elementToSliceViewWeakMap, sliceViewsSubject$ } = this;
      this.#patchedSliceViewPanels.add(sliceViewPanel);
      const originalDraw = sliceViewPanel.draw;
      sliceViewPanel.draw = function () {
        if (this.sliceView && !elementToSliceViewWeakMap.has(this.element)) {
          elementToSliceViewWeakMap.set(this.element, this.sliceView)
          const idx = determineIdx(this.element)
          sliceViewsSubject$.next({
            idx,
            sliceView: this.sliceView
          })
        }

        originalDraw.call(this)
      };
    };
    this.nehubaViewer.ngviewer.display.changed.add(() => {
      if (!this.nehubaViewer) return
      this.nehubaViewer.ngviewer.display.panels.forEach(patchSliceViewPanel)
    })
  }

  setLayerProperty(id: string, property: Partial<LayerProperties>) {
    const { transform, visible } = property;
    const layer = this.nehubaViewer?.ngviewer.layerManager.getLayerByName(id);
    if (!layer) throw new Error(`layer with id '${id}' not found`);

    if (typeof transform !== "undefined") {
      const dataSources = layer.layer.dataSources;
      if (dataSources.length !== 1) {
        throw new Error(
          `managed layer needs to have exactly 1 data source, but has ${dataSources.length} instead`
        );
      }
      if (dataSources[0].loadState) {
        const loadedStateXform = dataSources[0].loadState.transform;
        loadedStateXform.value = {
          ...loadedStateXform.value,
          transform: transform,
        };
      }
    }

    if (typeof visible !== "undefined") {
      layer.setVisible(visible)
    }
  }

  setPosition(position: number[]) {
    this.nehubaViewer?.ngviewer.navigationState.pose.position.restoreState(position)
  }

  setOrientation(orientation: number[]) {
    this.nehubaViewer?.ngviewer.navigationState.pose.orientation.restoreState( orientation )
  }
}
