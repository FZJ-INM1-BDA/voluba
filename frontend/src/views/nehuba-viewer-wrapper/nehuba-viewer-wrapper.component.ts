import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { distinctUntilChanged, fromEvent, map, merge, takeUntil } from 'rxjs';
import { isHtmlElement, Mat4, PatchedSymbol, SliceViewProviderType, SLICEVIEWS_INJECTION_TOKEN } from 'src/const';
import { DestroyDirective } from 'src/util/destroy.directive';

const NEHUBA_PATCHED = Symbol("NEHUBA_PATCHED")

export type NehubaLayer = {
  id: string;
  url: string;
  transform: Mat4;
};

const lightmode = {
  configName: 'BigBrain',
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
  restrictUserNavigation: true,
  disableSegmentSelection: true,
  dataset: {
    imageBackground: [1, 1, 1, 1],
    initialNgState: {
      showDefaultAnnotations: true,
      layers: {
        ' grey value: ': {
          annotationColor: '#cccccc',
          visible: false,
          type: 'image',
          // "source": "precomputed://http://imedv02.ime.kfa-juelich.de:8287/precomputed/BigBrainRelease.2015/8bit",
          source:
            'precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/8bit',
          transform: [
            [1, 0, 0, -70677184],
            [0, 1, 0, -70010000],
            [0, 0, 1, -58788284],
            [0, 0, 0, 1],
          ],
        },
        default: {
          // "source": `${sourceUrl}`
        },
      },
      perspectiveOrientation: [
        0.3140767216682434, -0.7418519854545593, 0.4988985061645508,
        -0.3195493221282959,
      ],
      perspectiveZoom: 1922235.5293810747,
      navigation: {
        zoomFactor: 350000,
      },
    },
  },
  layout: {
    views: 'hbp-neuro',
    planarSlicesBackground: [1, 1, 1, 0],
    useNehubaPerspective: {
      enableShiftDrag: false,
      doNotRestrictUserNavigation: false,
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
      restrictZoomLevel: {
        minZoom: 1200000 * 0.002,
        maxZoom: 3500000 * 0.002,
      },
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

  @Input()
  layers: NehubaLayer[] = [
    {
      id: 'big brain grey value',
      url: 'precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/8bit' && 'precomputed://http://127.0.0.1:8080/sharded/BigBrainRelease.2015/8bit',
      transform: [
        [1, 0, 0, -70677184],
        [0, 1, 0, -70010000],
        [0, 0, 1, -58788284],
        [0, 0, 0, 1],
      ],
    },
    {
      id: 'bla',
      url: 'precomputed://https://neuroglancer.humanbrainproject.eu/precomputed/JuBrain/v2.2c/colin27_seg' && 'precomputed://http://127.0.0.1:8080/sharded/WHS_SD_rat/templates/v1.01/t2star_masked/',
      transform: [
        [1.0, 0.0, 0.0, -75500000.0],
        [0.0, 1.0, 0.0, -111500000.0],
        [0.0, 0.0, 1.0, -67500000.0],
        [0.0, 0.0, 0.0, 1.0],
      ],
    },
  ];

  @Output()
  mousePosition = new EventEmitter<Float32Array>()

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
    @Inject(SLICEVIEWS_INJECTION_TOKEN) private sliceViewProvider: SliceViewProviderType
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
    this.nehubaViewer = export_nehuba.createNehubaViewer(config, console.error);

    const subscription = this.nehubaViewer.mousePosition.inVoxels.subscribe(val => {
      this.mousePosition.emit(val)
    })
    this.#destroyed$.subscribe(subscription.unsubscribe)
    
    this.#patchNehuba();
    (() => {
      (window as any).nehubaViewer = this.nehubaViewer
    })()
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

  #patchNehuba() {
    if (!this.nehubaViewer) return;

    const patchSliceViewPanel = (
      sliceViewPanel: export_nehuba.SliceViewPanel
    ) => {
      if (this.#patchedSliceViewPanels.has(sliceViewPanel)) return;
      const { elementToSliceViewWeakMap, sliceViewProvider } = this;
      this.#patchedSliceViewPanels.add(sliceViewPanel);
      const originalDraw = sliceViewPanel.draw;
      sliceViewPanel.draw = function () {
        if (this.sliceView) {
          sliceViewProvider.register({element: this.element, sliceview: this.sliceView})
          elementToSliceViewWeakMap.set(this.element, this.sliceView);
        }

        originalDraw.call(this);
      };
    };
    this.nehubaViewer.ngviewer.display.changed.add(() => {
      if (!this.nehubaViewer) return;
      this.nehubaViewer.ngviewer.display.panels.forEach(patchSliceViewPanel);
    });
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
}
