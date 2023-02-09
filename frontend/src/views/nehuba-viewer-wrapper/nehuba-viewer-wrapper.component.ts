import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { distinctUntilChanged, fromEvent, map, merge } from 'rxjs';
import { isHtmlElement, Mat4, PatchedSymbol } from 'src/const';

export type NehubaLayer = {
  id: string;
  url: string;
  transform: Mat4;
};

const _config = {
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

type LayerProperties = {
  transform: export_nehuba.mat4;
};

@Component({
  selector: 'voluba-nehuba-viewer-wrapper',
  templateUrl: './nehuba-viewer-wrapper.component.html',
  styleUrls: ['./nehuba-viewer-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'nehubaViewerWrapper',
})
export class NehubaViewerWrapperComponent
  implements OnDestroy, OnInit, AfterViewInit
{
  @Input()
  layers: NehubaLayer[] = [
    {
      id: 'big brain grey value',
      url: 'precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/8bit',
      transform: [
        [1, 0, 0, -70677184],
        [0, 1, 0, -70010000],
        [0, 0, 1, -58788284],
        [0, 0, 0, 1],
      ],
    },
    {
      id: 'bla',
      url: 'precomputed://https://neuroglancer.humanbrainproject.eu/precomputed/JuBrain/v2.2c/colin27_seg',
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

  #onDestroyCb: (() => void)[] = [];

  nehubaViewer: export_nehuba.NehubaViewer | null = null;
  elementToSliceViewWeakMap = new WeakMap<
    HTMLElement,
    export_nehuba.SliceView
  >();
  #patchedSliceViewPanels = new WeakSet<export_nehuba.SliceViewPanel>();

  constructor(private el: ElementRef) {}

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

    const subscription = this.nehubaViewer.mousePosition.inVoxels.subscribe(val => this.mousePosition.emit(val))
    this.#onDestroyCb.push(() => subscription.unsubscribe())
    
    this.#patchNehuba();
    (() => {
      (window as any).nehubaViewer = this.nehubaViewer
    })()
  }

  ngAfterViewInit(): void {
    const subscription = merge(
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
    )
      .pipe(
        distinctUntilChanged((o, n) => o === n || o?.sliceView === n?.sliceView)
      )
      .subscribe((v) => this.mousedownSliceView.emit(v));

    this.#onDestroyCb.push(() => subscription.unsubscribe());
  }

  ngOnDestroy(): void {
    while (this.#onDestroyCb.length) this.#onDestroyCb.pop()?.();
  }

  #patchNehuba() {
    if (!this.nehubaViewer) return;

    const patchSliceViewPanel = (
      sliceViewPanel: export_nehuba.SliceViewPanel
    ) => {
      if (this.#patchedSliceViewPanels.has(sliceViewPanel)) return;
      const { elementToSliceViewWeakMap } = this;
      this.#patchedSliceViewPanels.add(sliceViewPanel);
      const originalDraw = sliceViewPanel.draw;
      sliceViewPanel.draw = function () {
        if (this.sliceView) {
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

  setLayerProperty(id: string, property: LayerProperties) {
    const { transform } = property;
    const layer = this.nehubaViewer?.ngviewer.layerManager.getLayerByName(id);
    if (!layer) throw new Error(`layer with id '${id}' not found`);

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
}
