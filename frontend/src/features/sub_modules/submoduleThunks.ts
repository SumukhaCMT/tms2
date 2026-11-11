
import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getSubModules,
  getSubModuleById,
  createSubModule,
  updateSubModule,
  deleteSubModule,
} from "./services/submoduleService";

import type {
  CreateSubModulePayload,
  UpdateSubModulePayload,
} from "./submoduleTypes";

/* -------------------------------------------------------------------------- */
/* API ERROR TYPES                                                            */
/* -------------------------------------------------------------------------- */

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

interface ApiError {
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
  message?: string;
}

/* -------------------------------------------------------------------------- */
/* ERROR HANDLER                                                              */
/* -------------------------------------------------------------------------- */

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const apiError = error as ApiError;
  const status = apiError.response?.status;
  const responseData = apiError.response?.data;

  if (status === 429) {
    return "Too many requests. Please wait and try again.";
  }

  const validationMessage = responseData?.errors
    ? Object.values(responseData.errors).find(
        (message) => typeof message === "string" && message.trim(),
      )
    : undefined;

  return (
    responseData?.message ??
    responseData?.error ??
    validationMessage ??
    apiError.message ??
    fallback
  );
};

/* -------------------------------------------------------------------------- */
/* GET ALL                                                                    */
/* -------------------------------------------------------------------------- */

export const fetchSubModules = createAsyncThunk(
  "submodules/fetchSubModules",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
    }: {
      page?: number;
      limit?: number;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      return await getSubModules(page, limit, search);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch submodules."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* GET BY ID                                                                  */
/* -------------------------------------------------------------------------- */

export const fetchSubModuleById = createAsyncThunk(
  "submodules/fetchSubModuleById",
  async (
    id: number | string,
    { rejectWithValue },
  ) => {
    try {
      return await getSubModuleById(id);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch submodule."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* CREATE                                                                     */
/* -------------------------------------------------------------------------- */

export const addSubModule = createAsyncThunk(
  "submodules/addSubModule",
  async (
    data: CreateSubModulePayload,
    { rejectWithValue },
  ) => {
    try {
      return await createSubModule(data);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create submodule."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* UPDATE                                                                     */
/* -------------------------------------------------------------------------- */

export const editSubModule = createAsyncThunk(
  "submodules/editSubModule",
  async (
    data: UpdateSubModulePayload,
    { rejectWithValue },
  ) => {
    try {
      return await updateSubModule(data);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update submodule."),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* DELETE                                                                     */
/* -------------------------------------------------------------------------- */

export const removeSubModule = createAsyncThunk(
  "submodules/removeSubModule",
  async (
    id: number,
    { rejectWithValue },
  ) => {
    try {
      await deleteSubModule(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete submodule."),
      );
    }
  },
);
