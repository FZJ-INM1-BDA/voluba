export enum STAGE {
    SELECTION='SELECTION',
    ALIGNMENT='ALIGNMENT',
}

export type LocalState = {
    stage: STAGE
    incLocked: boolean
}

export const defaultState: LocalState = {
    stage: STAGE.ALIGNMENT, // STAGE.SELECTION,
    incLocked: false,
}

export const nameSpace = `app`