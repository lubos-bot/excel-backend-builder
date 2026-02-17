export type ResourceName = string;

export interface ExcelSchema {
  resources: ResourceName[];
  generatedAt: string;
}

export type RecordData = {
  id: string | number;
  [key: string]: any;
};