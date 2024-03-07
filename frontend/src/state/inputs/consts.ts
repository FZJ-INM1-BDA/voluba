const bigbrain: TVolume = {
  '@id': 'bigbrain',
  name: 'Big Brain (2015 Release)',
  volumes: [
    {
      '@type': 'siibra/volume/v0.0.1',
      providers: {
        'neuroglancer/precomputed':
          'https://neuroglancer.humanbrainproject.eu/precomputed/BigBrainRelease.2015/8bit',
        'neuroglancer/precomputed/surface':
          'https://neuroglancer.humanbrainproject.eu/precomputed/BigBrainRelease.2015/classif_mesh 100',
      },
    },
  ],
  size: [6572, 7404, 5711],
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
  size: [512, 1024, 512],
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
  size: [151, 188, 154],
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
  size: number[];
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
  incomingVolumes: [colin],
  selectedTemplate: bigbrain, //null,
  selectedIncoming: colin, //null
};
