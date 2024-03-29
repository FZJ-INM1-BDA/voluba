import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, concat, distinctUntilChanged, filter, firstValueFrom, from, map, of, scan, switchMap, takeUntil, withLatestFrom } from 'rxjs';
import * as inputs from 'src/state/inputs';
import * as appState from 'src/state/app'
import * as generalActions from "src/state/actions"
import { DestroyDirective } from 'src/util/destroy.directive';
import { ChumniPreflightResp, ChumniVolume, LOGIN_METHODS, SEGMENTATION_EXPLAINER_TEXT, VOLUBA_APP_CONFIG, VolubaAppConfig, isDefined, trimFilename } from 'src/const';
import { TVolume } from 'src/state/inputs/consts';

function arrayBufferToBase64String(arraybuffer: ArrayBuffer) {
  const bytes = new Uint8Array( arraybuffer )
  let binary = ''
  for (let i = 0; i < bytes.length; i ++){
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

type UploadStatus = {
  filename?: string|null
  extraTexts?: string[]|null
  preflight: boolean
  upload: boolean
}

@Component({
  selector: 'voluba-input-volumes',
  templateUrl: './input-volumes.component.html',
  styleUrls: ['./input-volumes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    DestroyDirective
  ]
})
export class InputVolumesComponent {

  destroyed$ = inject(DestroyDirective).destroyed$

  isSegmentation: boolean = false
  #file: File|undefined
  #refreshList$ = new Subject()
  #setUploadStatus$ = new Subject<Partial<UploadStatus>>()

  #uploadStatus$: Observable<UploadStatus> = concat(
    of({ preflight: false, upload: false } as UploadStatus),
    this.#setUploadStatus$
  ).pipe(
    scan((acc, curr) => ({
      ...acc,
      ...curr
    }), { preflight: false, upload: false } as UploadStatus)
  )

  inputCtrl = new FormGroup({
    selectedTemplate: new FormControl<string | null>(null),
    selectedIncoming: new FormControl<string | null>(null),
  })

  view$ = combineLatest([
    this.store$.pipe(
      select(inputs.selectors.templateVolumes)
    ),
    this.store$.pipe(
      select(inputs.selectors.incomingVolumes)
    ),
    this.store$.pipe(
      select(appState.selectors.user)
    ),
    this.store$.pipe(
      select(inputs.selectors.selectedIncoming)
    ),
    this.#uploadStatus$
  ]).pipe(
    map(([ availableTemplates, availableIncomings, user, selectedIncoming, { preflight, upload, filename, extraTexts } ]) => {
      return {
        availableTemplates,
        availableIncomings,
        user,
        loginMethods: LOGIN_METHODS,
        selectedIncoming,
        preflight,
        upload,
        filename,
        extraTexts,
        segmentationCheckboxExplainer: SEGMENTATION_EXPLAINER_TEXT,
      }
    })
  )

  constructor(private store$: Store, @Inject(VOLUBA_APP_CONFIG) private appCfg: VolubaAppConfig) {
    
    this.store$.pipe(
      select(inputs.selectors.selectedTemplate),
      distinctUntilChanged((o, n) => o?.id === n?.id),
      takeUntil(this.destroyed$),
    ).subscribe(tmpl => {
      this.inputCtrl.controls.selectedTemplate.patchValue(tmpl?.id || null)
    })

    this.store$.pipe(
      select(inputs.selectors.selectedIncoming),
      distinctUntilChanged((o, n) => o?.id === n?.id),
      takeUntil(this.destroyed$),
    ).subscribe(inc => {
      this.inputCtrl.controls.selectedIncoming.patchValue(inc?.id || null)
    })

    concat(
      of(null),
      this.#refreshList$,
    ).pipe(
      takeUntil(this.destroyed$),
      withLatestFrom(
        this.store$.pipe(
          select(appState.selectors.user),
        )
      ),
      switchMap(([_, user]) => {
        const authHeader: { Authorization?: string } = !!user
        ? { 'Authorization': `Bearer ${user.authtoken}` }
        : {}
        return fetch(`${this.appCfg.uploadUrl}/list`, {
          headers: {
            ...authHeader
          }
        }).then(res => res.json())
      })
    ).subscribe((chumniVolumes: ChumniVolume[]) => {
      const incomingVolumes = chumniVolumes.map(vol => {
        const { name, extra: { neuroglancer: { resolution, size } }, links: { normalized }, visibility } = vol
        const dim = resolution.map((res, idx) => res * size[idx])
        return {
          id: name,
          name: name,
          volumes: [
            {
              "@type": "siibra/volume/v0.0.1",
              providers: {
                "neuroglancer/precomputed": `${this.appCfg.uploadUrl}${normalized}`
              }
            }
          ],
          dim,
          visibility
        } as TVolume
      })

      this.store$.dispatch(
        inputs.actions.setIncoming({
          incomingVolumes
        })
      )
    })
    
    this.inputCtrl.valueChanges.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(({ selectedTemplate, selectedIncoming }) => {
      if (selectedTemplate) {
        this.store$.dispatch(
          inputs.actions.selectTemplate({
            id: selectedTemplate
          })
        )
      }
      if (selectedIncoming) {
        this.store$.dispatch(
          inputs.actions.selecteIncoming({
            id: selectedIncoming
          })
        )
      }
    })
  }

  async handleDragDropFile(files: File[]|FileList|null){
    if (files === null) {
      return
    }
    if (files instanceof FileList) {
      files = Array.from(files)
    }
    const file = files[0]
    if (!file) {
      return
    }

    this.#file = file
    const filesize = `Filesize: ${file.size} bytes`

    this.#setUploadStatus$.next({
      preflight: true,
      filename: file.name,
      extraTexts: [ filesize ]
    })
    const result = await this.#preflight(file)
    this.#setUploadStatus$.next({
      preflight: false,
      extraTexts: [
        filesize,
        ...result.warnings.map(v => `Warning: ${v}`)
      ]
    })

  }

  async #preflight(file: File){

    const user = await firstValueFrom(
      this.store$.pipe(
        select(
          appState.selectors.user
        )
      )
    )
    if (!user) {
      throw new Error(`User must be authenticated before they can upload any files!`)
    }

    const blob = file.slice(0, 2048)
    const fileReader = new FileReader()

    return new Promise<ChumniPreflightResp>((rs, rj) => {

      fileReader.onload = ev => {
        const result = ev?.target?.result
        if (!result) {
          rj(`Cannot find ev.target.result!`)
          return
        }

        if (!(result instanceof ArrayBuffer)) {
          rj(`Expected result to be array buffer, but was not.`)
          return
        }
        
        const _2048B64 = arrayBufferToBase64String(result)
        const { name, size, type } = file

        /**
         * or use formdata
         */
        const blob = new Blob([new Uint8Array(result)])
        const slicedFile = new File([blob], name)

        const formData = new FormData()
        formData.append('image', slicedFile)

        const preflightUrl = `${this.appCfg.uploadUrl}/preflight`
        fetch(preflightUrl, {
          method: 'POST',
          headers: {
            'X-CHUNMA-FILESIZE': file.size.toString(),
            'X-CHUNMA-SEGMENTATION': 'false',
            'Authorization': `Bearer ${user.authtoken}`
          },
          body: formData
        })
        .then(res => res.json())
        .then((jsonResp: ChumniPreflightResp) => rs(jsonResp))
        .catch(rj)
      }
      fileReader.onerror = rj
      fileReader.readAsArrayBuffer(blob)
    })
  }

  async deleteVolume(volumeId: string|undefined) {
    if (!volumeId) {
      return
    }
    const [user, incomingVolumes] = await firstValueFrom(
      combineLatest([
        this.store$.pipe(
          select(appState.selectors.user)
        ),
        this.store$.pipe(
          select(inputs.selectors.incomingVolumes)
        ),
      ])
    )
    if (!user) {
      throw new Error(`User must be authenticated before they can upload any files!`)
    }
    
    const authHeader: { Authorization?: string } = !!user
    ? { 'Authorization': `Bearer ${user.authtoken}` }
    : {}

    const deleteVolume = incomingVolumes.find(v => v.id === volumeId)

    if (!deleteVolume) {
      throw new Error(`Volume with id ${volumeId} not found.`)
    }

    const ngUrls = deleteVolume.volumes.map(v => v.providers["neuroglancer/precomputed"]).filter(isDefined)
    if (ngUrls.length !== 1) {
      throw new Error(`Expecting one and only one url to be deleted, but got ${ngUrls.length}: ${ngUrls}`)
    }
    const ngUrl = ngUrls[0]
    
    const volName = trimFilename(deleteVolume.name)
    try {
      const res = await fetch(ngUrl, {
        method: 'DELETE',
        headers: {
          ...authHeader
        }
      })
      if (!res.ok) {
        throw new Error(`Error deleting: ${res.status}`)
      }
      this.store$.dispatch(
        generalActions.info({
          message: `Volume ${volName} deleted.`
        })
      )
      
    } catch (e) {
      this.store$.dispatch(
        generalActions.error({
          message: `Error: ${(e as Error).toString()}.\nVolume ${volName} not deleted.`
        })
      )
    } finally {
      this.#refreshList$.next(true)
    }
  }

  clearUpload(){
    this.#setUploadStatus$.next({
      filename: null,
      extraTexts: null,
    })
    this.#file = undefined
  }

  async upload(){
    if (!this.#file) {
      return
    }
    const user = await firstValueFrom(
      this.store$.pipe(
        select(
          appState.selectors.user
        )
      )
    )
    if (!user) {
      throw new Error(`User must be authenticated before they can upload any files!`)
    }
    this.#setUploadStatus$.next({ upload: true })

    try {

      /**
       * TODO
       * fetch does not support progress
       * if progress is required in the future, switch to xmlhttprequest in future
       */
      // const xhr = new XMLHttpRequest()
      
      const formData = new FormData()
      formData.append('image', this.#file)
      const resp = await fetch(`${this.appCfg.uploadUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.authtoken}`
        },
        body: formData
      })
      if (!resp.ok) {
        throw new Error(`Error: ${resp.status}`)
      }

      this.#refreshList$.next(null)

      const uploadedVolumeSelector = this.store$.pipe(
        select(inputs.selectors.incomingVolumes),
        map(vols => vols.find(vol => this.#file?.name.includes(vol.name))),
        filter(isDefined)
      )

      const uploadedVolume = await firstValueFrom(uploadedVolumeSelector)
      this.store$.dispatch(
        inputs.actions.selecteIncoming({
          id: uploadedVolume.id
        })
      )
      this.store$.dispatch(
        generalActions.info({
          message: `File ${trimFilename(this.#file.name)} uploaded and selected.`
        })
      )
      this.clearUpload()
      
    } catch (e) {
      this.store$.dispatch(
        generalActions.error({
          message: `Error: ${(e as any).toString()}`
        })
      )
    } finally {
      this.#setUploadStatus$.next({ upload: false })
    }
    
  }
}
