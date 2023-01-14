type Vec3 = [number, number, number]
type Color = string

export type Landmark = {
    targetVolumeId: string
    position: Vec3
}

export type LandmarkPair = {
    tmplLm: Landmark
    incLm: Landmark
    color: Color
    id: string
    name: string
}
