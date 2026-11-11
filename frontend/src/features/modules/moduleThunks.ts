


import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getModulesList,
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "./services/moduleServices";

import type {
  Module,
  CreateModulePayload,
  UpdateModulePayload,
} from "./moduleTypes";

/* -------------------------------------------------------------------------- */
/* Error Handling                                                             */
/* -------------------------------------------------------------------------- */

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

interface ApiError {
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
  message?: string;
}

const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const err = error as ApiError;

  if (err.response?.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // Display the backend message, including duplicate-name errors.
  return (
    err.response?.data?.message ??
    err.message ??
    fallback
  );
};

/* -------------------------------------------------------------------------- */
/* Fetch Modules List                                                         */
/* -------------------------------------------------------------------------- */

export const fetchModulesList = createAsyncThunk<
  Module[],
  void,
  { rejectValue: string }
>(
  "modules/fetchModulesList",
  async (_, { rejectWithValue }) => {
    try {
      return await getModulesList();
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch modules."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Fetch Modules                                                              */
/* -------------------------------------------------------------------------- */

export const fetchModules = createAsyncThunk<
  Awaited<ReturnType<typeof getModules>>,
  { page?: number; limit?: number; search?: string } | undefined,
  { rejectValue: string }
>(
  "modules/fetchModules",
  async (
    { page = 1, limit = 10, search = "" } = {},
    { rejectWithValue },
  ) => {
    try {
      return await getModules(page, limit, search);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch modules."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Fetch Module By ID                                                         */
/* -------------------------------------------------------------------------- */

export const fetchModuleById = createAsyncThunk<
  Awaited<ReturnType<typeof getModuleById>>,
  number | string,
  { rejectValue: string }
>(
  "modules/fetchModuleById",
  async (id, { rejectWithValue }) => {
    try {
      return await getModuleById(id);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch module."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Create Module                                                              */
/* -------------------------------------------------------------------------- */

export const addModule = createAsyncThunk<
  Awaited<ReturnType<typeof createModule>>,
  CreateModulePayload,
  { rejectValue: string }
>(
  "modules/addModule",
  async (data, { rejectWithValue }) => {
    try {
      return await createModule(data);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create module."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Update Module                                                              */
/* -------------------------------------------------------------------------- */

export const editModule = createAsyncThunk<
  Awaited<ReturnType<typeof updateModule>>,
  UpdateModulePayload,
  { rejectValue: string }
>(
  "modules/editModule",
  async (data, { rejectWithValue }) => {
    try {
      return await updateModule(data);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update module."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Delete Module                                                              */
/* -------------------------------------------------------------------------- */

export const removeModule = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "modules/removeModule",
  async (id, { rejectWithValue }) => {
    try {
      await deleteModule(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete module."),
      );
    }
  },
);
