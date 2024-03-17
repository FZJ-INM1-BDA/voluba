const bigbrain: TVolume = {
  '@id': 'bigbrain',
  name: 'Big Brain (2015 Release)',
  volumes: [
    {
      '@type': 'siibra/volume/v0.0.1',
      providers: {
        'neuroglancer/precomputed':
          'http://127.0.0.1:8080/sharded/BigBrainRelease.2015/8bit',
        'neuroglancer/precomputed/surface':
          'https://neuroglancer.humanbrainproject.eu/precomputed/BigBrainRelease.2015/classif_mesh 100',
      },
    },
  ],
  dim: [6572, 7404, 5711],
};

const waxholm: TVolume = {
  '@id': 'waxholm',
  name: 'Waxholm Rat',
  volumes: [
    {
      '@type': 'siibra/volume/v0.0.1',
      providers: {
        'neuroglancer/precomputed':
          'https://neuroglancer.humanbrainproject.eu/precomputed/WHS_SD_rat/templates/v1.01/t2star_masked',
      },
    },
  ],
  dim: [512, 1024, 512].map(v => v * 39062.5),
};

const colin: TVolume = {
  '@id': 'colin27',
  name: 'Colin 27',
  volumes: [
    {
      '@type': 'siibra/volume/v0.0.1',
      providers: {
        'neuroglancer/precomputed':
          'https://neuroglancer.humanbrainproject.eu/precomputed/JuBrain/v2.2c/colin27_seg',
      },
    },
  ],
  dim: [151, 188, 154].map(v => v * 1e6),
};

type Volume = {
  '@type': 'siibra/volume/v0.0.1';
  providers: {
    'neuroglancer/precomputed': string;
    'neuroglancer/precomputed/surface'?: string;
  };
};

export type TVolume = {
  '@id': string;
  name: string;
  volumes: Volume[];
  dim: number[];
};
export const nameSpace = `[inputs]`;
export type LocalState = {
  templateVolumes: TVolume[];
  incomingVolumes: TVolume[];
  selectedTemplate: TVolume | null;
  selectedIncoming: TVolume | null;
};

export const defaultState: LocalState = {
  templateVolumes: [bigbrain, waxholm],
  incomingVolumes: [waxholm],
  selectedTemplate: bigbrain, //null,
  selectedIncoming: waxholm, //null
};
