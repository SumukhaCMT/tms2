
import { createAsyncThunk } from "@reduxjs/toolkit";

import { sevaService } from "./services/sevaServices";

import type {
  Seva,
  CreateSevaPayload,
  UpdateSevaPayload,
  SevaListQuery,
  SevaListResult,
} from "./sevaTypes";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: { message?: string };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

export const fetchSevas = createAsyncThunk<
  SevaListResult,
  SevaListQuery,
  { rejectValue: string }
>(
  "seva/fetchSevas",
  async (query, { rejectWithValue }) => {
    try {
      return await sevaService.getAll(query);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchSevaById = createAsyncThunk<
  Seva,
  number,
  { rejectValue: string }
>(
  "seva/fetchSevaById",
  async (id, { rejectWithValue }) => {
    try {
      return await sevaService.getById(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createSeva = createAsyncThunk<
  Seva,
  CreateSevaPayload,
  { rejectValue: string }
>(
  "seva/createSeva",
  async (payload, { rejectWithValue }) => {
    try {
      return await sevaService.create(payload);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateSeva = createAsyncThunk<
  Seva,
  { id: number; payload: UpdateSevaPayload },
  { rejectValue: string }
>(
  "seva/updateSeva",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await sevaService.update(id, payload);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteSeva = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "seva/deleteSeva",
  async (id, { rejectWithValue }) => {
    try {
      return await sevaService.remove(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
