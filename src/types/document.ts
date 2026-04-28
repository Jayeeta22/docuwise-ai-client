export type DocumentListItem = {
  id: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

export type DocumentDetail = DocumentListItem & {
  extractedText: string;
  keyValuePairs: { key: string; value: string }[];
  tablesPreview: string;
  updatedAt: string;
};
