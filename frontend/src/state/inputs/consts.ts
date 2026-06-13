const bigbrain: TVolume = {
  id: 'bigbrain',
  name: 'Big Brain (2015 Release)',
  volumes: [
    {
      '@type': 'siibra/volume/v0.0.1',
      providers: {
        'neuroglancer/precomputed': 'https://data-proxy.ebrains.eu/api/v1/buckets/reference-atlas-data/sharded/BigBrainRelease.2015/8bit',
        'neuroglancer/precomputed/surface': 'https://neuroglancer.humanbrainproject.eu/precomputed/BigBrainRelease.2015/classif_mesh 100',
      },
    },
  ],
}
const bVols: TVolume[] = [
  {
    id: 'whole-brain-dataset',
    name: 'Whole brain dataset',
    volumes: [
      {
        '@type': 'siibra/volume/v0.0.1',
        providers: {
          'neuroglancer/precomputed': 'https://neuroglancer.humanbrainproject.org/precomputed/JuBrain/v2.2c/colin27_seg',
        },
      },
    ],
    visibility: 'bundled'
  },
  {
    id: 'nucleus-subthalamicus',
    name: 'Nucleus subthalamicus (B20)',
    volumes: [
      {
        '@type': 'siibra/volume/v0.0.1',
        providers: {
          'neuroglancer/precomputed': 'https://data-proxy.ebrains.eu/api/v1/buckets/reference-atlas-data/precomputed/landmark-reg/B20_stn_l/v10',
        },
      },
    ],
    visibility: 'bundled'
  },
  {
    id: 'inc-2',
    name: 'Hippocampus unmasked',
    volumes: [
      {
        '@type': 'siibra/volume/v0.0.1',
        providers: {
          'neuroglancer/precomputed': 'https://data-proxy.ebrains.eu/api/v1/buckets/reference-atlas-data/precomputed/landmark-reg/hippocampus-unmasked',
        },
      },
    ],
    visibility: 'bundled'
  },
]

export const waxholm: TVolume = {
  id: 'waxholm',
  name: 'Waxholm Space of the Sprague Dawley v1.01',
  volumes: [
    {
      '@type': 'siibra/volume/v0.0.1',
      providers: {
        'neuroglancer/precomputed': 'https://neuroglancer.humanbrainproject.eu/precomputed/WHS_SD_rat/templates/v1.01/t2star_masked',
      },
    },
  ],
}

const allen: TVolume = {
  id: 'allen',
  name: 'Allen Mouse Common Coordinate Framework v3',
  volumes: [
    {
      '@type': 'siibra/volume/v0.0.1',
      providers: {
        'neuroglancer/precomputed': 'https://neuroglancer.humanbrainproject.eu/precomputed/AMBA/templates/v3/stpt',
      },
    },
  ],
};

import { TVolume } from "src/const"
export { TVolume }

export const nameSpace = `[inputs]`
export type LocalState = {
  templateVolumes: TVolume[]
  incomingVolumes: TVolume[]
  selectedTemplate: TVolume | null
  selectedIncoming: TVolume | null
};

export const defaultState: LocalState = {
  templateVolumes: [bigbrain, waxholm, allen],
  incomingVolumes: bVols,
  selectedTemplate: bigbrain,
  selectedIncoming: null
}
