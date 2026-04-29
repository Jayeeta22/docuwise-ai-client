import { createContext, useContext, useMemo, type ReactNode } from "react";

export type TranslationKey =
  | "nav.dashboard"
  | "nav.documents"
  | "nav.logout"
  | "nav.login"
  | "nav.register"
  | "nav.signingOut"
  | "doc.details"
  | "doc.reviewAndChat"
  | "doc.backToDocuments"
  | "doc.preview"
  | "doc.extractedInsights"
  | "doc.ocrPreview"
  | "doc.noKeyValue"
  | "doc.tablesPreview"
  | "doc.chatTitle"
  | "doc.askHint"
  | "doc.send"
  | "docs.title"
  | "docs.subtitle"
  | "docs.upload"
  | "docs.uploadHint"
  | "docs.uploadFormats"
  | "docs.yourUploads"
  | "docs.noDocuments";

const translations: Record<TranslationKey, string> = {
  "nav.dashboard": "Dashboard",
  "nav.documents": "Documents",
  "nav.logout": "Logout",
  "nav.login": "Login",
  "nav.register": "Register",
  "nav.signingOut": "Signing out…",
  "doc.details": "Document details",
  "doc.reviewAndChat": "Review extracted content and chat with this document.",
  "doc.backToDocuments": "Back to documents",
  "doc.preview": "Document preview",
  "doc.extractedInsights": "Extracted insights",
  "doc.ocrPreview": "Normal preview (OCR text)",
  "doc.noKeyValue": "No key-value pairs detected for this document.",
  "doc.tablesPreview": "Tables preview",
  "doc.chatTitle": "Chat with this document",
  "doc.askHint": "Ask a question about the document content.",
  "doc.send": "Send",
  "docs.title": "Documents",
  "docs.subtitle": "Upload PDFs or images. Click a document row to open a dedicated detail page.",
  "docs.upload": "Upload",
  "docs.uploadHint": "Click or drag file here",
  "docs.uploadFormats": "PDF, PNG, JPEG, WebP — max 16 MB",
  "docs.yourUploads": "Your uploads",
  "docs.noDocuments": "No documents yet",
};

type I18nContextValue = {
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const value = useMemo<I18nContextValue>(
    () => ({
      t: (key) => translations[key],
    }),
    [],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
