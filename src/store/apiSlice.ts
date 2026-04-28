import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "../lib/apiBase";
import type { AuthPayload, AuthResponse } from "../types/auth";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    credentials: "include",
  }),
  tagTypes: ["Auth"],
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
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useHealthQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = apiSlice;
