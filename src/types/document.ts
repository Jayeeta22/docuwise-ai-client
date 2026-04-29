export type DocumentCategory = "resume" | "invoice" | "receipt" | "general";

export type InvoiceLineItem = {
  description?: string;
  quantity?: number | string;
  unitPrice?: number | string;
  amount?: number | string;
};

export type InvoiceFields = {
  invoiceNumber?: string;
  vendorName?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  subtotal?: number | string;
  tax?: number | string;
  total?: number | string;
  lineItems?: InvoiceLineItem[];
};

export type ReceiptLineItem = {
  description?: string;
  quantity?: number | string;
  unitPrice?: number | string;
  amount?: number | string;
};

export type ReceiptFields = {
  merchantName?: string;
  receiptNumber?: string;
  transactionDate?: string;
  currency?: string;
  subtotal?: number | string;
  tax?: number | string;
  total?: number | string;
  lineItems?: ReceiptLineItem[];
};

export type DocumentListItem = {
  id: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  category: DocumentCategory;
};

export type DocumentDetail = DocumentListItem & {
  extractedText: string;
  keyValuePairs: { key: string; value: string }[];
  tablesPreview: string;
  detectedLanguage: string;
  keyPhrases: string[];
  entities: { text: string; category: string; confidenceScore: number }[];
  invoiceFields?: InvoiceFields;
  receiptFields?: ReceiptFields;
  updatedAt: string;
};
