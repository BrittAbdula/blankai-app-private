export type ToolKey = "clean" | "inspect" | "compare";

export interface CleanSeed {
  file: File;
  previewDataUrl?: string | null;
}

export interface CompareSeed {
  cleanedDataUrl: string;
  cleanedHash: string;
  cleanedName: string;
  cleanedSize: number;
  height: number;
  metadataRemoved: string[];
  originalDataUrl: string;
  originalHash: string;
  originalName: string;
  originalSize: number;
  width: number;
}
