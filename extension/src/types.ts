export type ToolKey = "clean" | "inspect" | "compare";

export interface CompareSeed {
  cleanedDataUrl: string;
  cleanedName: string;
  cleanedSize: number;
  originalDataUrl: string;
  originalName: string;
  originalSize: number;
}
