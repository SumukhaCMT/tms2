
import { createAsyncThunk } from "@reduxjs/toolkit";
import { devoteeService } from "./services/devoteeService";
import type {
  Devotee,
  DevoteeFormData,
  DevoteeListParams,
  
} from "./devoteeTypes";

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

    return response?.data?.message || "Something went wrong.";
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}

export const fetchDevotees = createAsyncThunk(
  "devotees/fetchAll",
  async (params: DevoteeListParams = {}, { rejectWithValue }) => {
    try {
      return await devoteeService.getAll(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchDevoteeById = createAsyncThunk(
  "devotees/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await devoteeService.getById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const searchDevotees = createAsyncThunk(
  "devotees/search",
  async (search: string, { rejectWithValue }) => {
    try {
      return await devoteeService.search(search);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateDevotee = createAsyncThunk<
  Devotee,
  { id: number; data: Partial<DevoteeFormData> },
  { rejectValue: string }
>(
  "devotees/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await devoteeService.update(id, data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);


export const deleteDevotee = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "devotees/deleteDevotee",
  async (id, { rejectWithValue }) => {
    try {
      await devoteeService.deleteDevotee(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

