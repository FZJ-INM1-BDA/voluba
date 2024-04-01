declare namespace export_nehuba {
  class vec3 extends Float32Array {
    static fromValues(...arr: number[]): vec3
    static transformMat4(rec: vec3|number[], src: vec3|number[], mat: mat4): vec3
    static transformQuat(rec: vec3, src: vec3, quat: quat): vec3
    static sub(rec: vec3|number[], src: vec3|number[], dst: vec3|number[]): vec3|number[]
    static create(): vec3
    static add(rec: vec3|number[], src: vec3|number[], dst: vec3|number[]): vec3|number[]
    static mul(rec: vec3|number[], src: vec3|number[], m: vec3|number[]): vec3|number[]
    static inverse(rec: vec3, src: vec3): vec3
    static scale(rec: vec3|number[], src: vec3|number[], s: number): vec3|number[]
    static divide(out: vec3, a: vec3, b: vec3): vec3
    static div(out: vec3|number[], a: vec3|number[], b: vec3|number[]): vec3|number[]
  }

  class quat extends Float32Array {
    static fromValues(...arr: number[]): vec3
    static create(): quat
    static mul(rec: quat, src: quat, m: quat): quat
    static setAxisAngle(rec: quat, axis: vec3, angle: number): quat
    static getAxisAngle(rec: vec3, q: quat): number
    static invert(rec: quat, src: quat): quat
    static normalize(rec: quat, src: quat): quat
    static fromEuler(rec: quat, x: number, y: number, z: number): quat
  }

  class mat4 extends Float32Array {
    static fromValues(...a: number[]): mat4
    static create(): mat4
    static getTranslation(rec: vec3|number[], mat: mat4|number[]): vec3|number[]
    static fromRotationTranslationScale(out: mat4|number[], q: quat|number[], v: vec3|number[], s: vec3|number[]): mat4|number[]
    static getRotation(out: quat, mat: mat4|number[]): quat
    static getScaling(out: vec3, mat: mat4): vec3
    static translate(out: mat4, src: mat4, translate: vec3): mat4
    static fromScaling(out: mat4, scale: vec3): mat4
    static mul(out: mat4|number[], src: mat4|number[], m: mat4|number[]): mat4|number[]
    static invert(out: mat4, src: mat4): mat4
    static fromTranslation(out: mat4|number[], transl: vec3|number[]): mat4|number[]
    static fromRotation(out: mat4, angle: number, axis: vec3 ): mat4
    static transpose(out:  mat4, src: mat4): mat4
    static fromQuat(out: mat4|number[], q: quat|number[]): mat4|number[]
  }

  class UrlHashBinding {
    setUrlHash(): void
    updateFromUrlHash(): void
  }

  interface SliceView {
    width: number
    height: number
    viewMatrix: mat4
    invViewMatrix: mat4
    centerDataPosition: vec3
    viewChanged: {
      add(callback: () => void): () => void
    }
    navigationState: {
      pose: {
        orientation: {
          orientation: quat
        }
      }
    }
  }

  interface Subscriber {
    unsubscribe(): void
  }
  
  interface Observable<T> {
    subscribe(subFn: (value:T) => void): Subscriber
    filter(predicate: (value:T) => boolean): Observable<T>
    map<R>(predicate: (value: T) => R): Observable<R>
  }
  
  interface SliceViewPanel {
    draw(): void
    sliceView: SliceView
    element: HTMLElement
  }

  class ManagedLayer {
    get layer(): any
    setVisible(flag: boolean): void
  }

  interface NgJsonable<T extends Record<string, any>=any> {
    restoreState(state: any): void
    toJSON(): T
  }
  
  type Unit = 'km' | 'm' | 'mm' | 'µm' | 'nm' | 'pm'
  type Dimension = [number, Unit]

  interface NehubaViewer {
    ngviewer: {
      layerManager: {
        getLayerByName(layername: string): ManagedLayer|undefined
        managedLayers: ManagedLayer[]
      },
      display: {
        panels: SliceViewPanel[]
        changed: {
          add: (callback: () => void) => void
        }
      },
      navigationState: {
        pose: {
          orientation: NgJsonable
          position: NgJsonable
        }
      }
      coordinateSpace: NgJsonable<Record<'x'|'y'|'z', Dimension>>
    }
    readonly navigationState: {
      readonly position: {
        inVoxels: Observable<Float32Array>
      },
      readonly orientation: Observable<Float32Array>
      readonly sliceZoom: Observable<number>
      readonly full: Observable<{position: Float32Array, orientation: Float32Array, zoom: number}>
      readonly perspectiveZoom: Observable<number>
      readonly perspectiveOrientation: Observable<Float32Array>
      readonly all: Observable<{position: Float32Array, orientation: Float32Array, zoom: number, perspectiveZoom: number, perspectiveOrientation: Float32Array}>
    }
    readonly mousePosition: {
      readonly inVoxels: Observable<Float32Array>
    }
  }

  function getNgPatchableObj(): ({ UrlHashBinding: typeof UrlHashBinding })
  function createNehubaViewer(config: any, errorHandler: (error: Error) => void): NehubaViewer
}
