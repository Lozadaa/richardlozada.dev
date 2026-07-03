import raw from "./face-data.json";
export interface FaceData { w: number; h: number; rows: string[]; bright: number[][] }
export const faceData: FaceData = raw as FaceData;
