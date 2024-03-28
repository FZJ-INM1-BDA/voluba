export type LocalState = {
  transformStr: string; // joined string, easier to detect change
  flippedState: string;
};

export const nameSpace = `outputs`;

export const defaultState: LocalState = {
  transformStr: `1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1`,
  flippedState: `1,1,1`,
};

export type MatrixInput = Partial<{
  text: string;
  array: number[][];
}>;

export type Vec3Input = Partial<{
  text: string;
  array: number[];
}>;

export type QuatInput = Partial<{
  text: string;
  array: number[];
}>;

export function processVec3Input(input: Vec3Input): export_nehuba.vec3 {
  const { text, array } = input;
  const { vec3: _vec3 } = export_nehuba;

  let returnVec3: Float32Array | null = null;
  if (text)
    returnVec3 = _vec3.fromValues(...text.split(',').map((v) => Number(v)));
  if (array) returnVec3 = _vec3.fromValues(...array);

  if (!returnVec3) throw new Error(`one of array, text must be defined!`);
  return returnVec3;
}

export function processQuatInput(input: QuatInput): export_nehuba.quat {
  const { text, array } = input;
  const { quat: _quat } = export_nehuba;

  let returnQuat: Float32Array | null = null;
  if (text)
    returnQuat = _quat.fromValues(...text.split(',').map((v) => Number(v)));
  if (array) returnQuat = _quat.fromValues(...array);

  if (!returnQuat) throw new Error(`one of array, text must be defined!`);
  return returnQuat;
}

export function mat4toStr(mat: export_nehuba.mat4) {
  return Array.from(mat).join(',');
}

export function getMirrorMat(
  flippedState: export_nehuba.vec3,
  size: export_nehuba.vec3
) {
  const { vec3, mat4 } = export_nehuba;

  const applyMirror = mat4.create();
  const mirrorVec = vec3.fromValues(...flippedState);

  /**
   * apply mirror
   */
  mat4.fromScaling(applyMirror, mirrorVec);
  /**
   * undo translation
   */
  const undoTranslVec = vec3.fromValues(
    ...flippedState.map((v) => (v < 0 ? v : 0))
  );
  vec3.mul(undoTranslVec, undoTranslVec, size);
  mat4.mul(
    applyMirror,
    applyMirror,
    mat4.fromTranslation(mat4.create(), undoTranslVec)
  );

  return {
    applyMirror,
    undoMirror: mat4.invert(mat4.create(), applyMirror),
  }
}


export type ExportJson = {
  incomingVolume: string
  contentHash: string
  referenceVolume: string
  version: string|number
  '@type': 'https://voluba.apps.hbp.eu/@types/transform'
  transform: number[]
  coordinateSpace?: {
    x: export_nehuba.Dimension
    y: export_nehuba.Dimension
    z: export_nehuba.Dimension
  } | null
}
