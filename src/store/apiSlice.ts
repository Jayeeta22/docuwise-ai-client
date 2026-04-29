import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "../lib/apiBase";
import type { AuthPayload, AuthResponse } from "../types/auth";
import type { DocumentDetail, DocumentListItem } from "../types/document";

export type ChatUsage = {
  limit: number;
  used: number;
  remaining: number;
  monthKey: string;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    credentials: "include",
  }),
  tagTypes: ["Auth", "Document"],
  endpoints: (builder) => ({
    getMe: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    health: builder.query<unknown, void>({
      query: () => "/health",
    }),
    login: builder.mutation<AuthResponse, AuthPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(apiSlice.util.updateQueryData("getMe", undefined, () => data));
      },
    }),
    register: builder.mutation<AuthResponse, AuthPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(apiSlice.util.updateQueryData("getMe", undefined, () => data));
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Document"],
    }),
    getDocuments: builder.query<{ documents: DocumentListItem[] }, void>({
      query: () => "/documents",
      providesTags: ["Document"],
    }),
    getDocument: builder.query<{ document: DocumentDetail }, string>({
      query: (id) => `/documents/${encodeURIComponent(id)}`,
      providesTags: (_result, _err, id) => [{ type: "Document", id }],
    }),
    uploadDocument: builder.mutation<{ document: DocumentListItem }, FormData>({
      query: (formData) => ({
        url: "/documents/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Document"],
    }),
    deleteDocument: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/documents/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Document"],
    }),
    chatDocument: builder.mutation<{ reply: string; usage?: ChatUsage }, { id: string; message: string; replyLanguage?: string }>({
      query: ({ id, message, replyLanguage }) => ({
        url: `/documents/${encodeURIComponent(id)}/chat`,
        method: "POST",
        body: { message, replyLanguage },
      }),
    }),
    getChatUsage: builder.query<ChatUsage, void>({
      query: () => "/documents/chat/limit",
    }),
    translateDocument: builder.mutation<
      { translatedExtractedText: string; translatedTablesPreview: string; targetLanguage: string },
      { id: string; targetLanguage: string }
    >({
      query: ({ id, targetLanguage }) => ({
        url: `/documents/${encodeURIComponent(id)}/translate`,
        method: "POST",
        body: { targetLanguage },
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useHealthQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useChatDocumentMutation,
  useGetChatUsageQuery,
  useTranslateDocumentMutation,
} = apiSlice;
