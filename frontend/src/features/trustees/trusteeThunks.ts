

import { createAsyncThunk } from "@reduxjs/toolkit";

import { trusteeService } from "./services/trusteeService";
import type {
  CreateTrusteePayload,
  Trustee,
  TrusteeListQuery,
  TrusteeListResponse,
  UpdateTrusteePayload,
} from "./trusteeTypes";

export const fetchTrustees = createAsyncThunk<
  TrusteeListResponse,
  TrusteeListQuery | undefined,
  { rejectValue: string }
>("trustees/fetchAll", async (query, { rejectWithValue }) => {
  try {
    return await trusteeService.getAll(query);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch trustees",
    );
  }
});

export const fetchTrusteeById = createAsyncThunk<
  Trustee,
  number,
  { rejectValue: string }
>("trustees/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await trusteeService.getById(id);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch trustee",
    );
  }
});

export const createTrustee = createAsyncThunk<
  Trustee,
  CreateTrusteePayload,
  { rejectValue: string }
>("trustees/create", async (payload, { rejectWithValue }) => {
  try {
    return await trusteeService.create(payload);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to create trustee",
    );
  }
});

export const updateTrustee = createAsyncThunk<
  Trustee,
  { id: number; payload: UpdateTrusteePayload },
  { rejectValue: string }
>("trustees/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await trusteeService.update(id, payload);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to update trustee",
    );
  }
});

export const deleteTrustee = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("trustees/delete", async (id, { rejectWithValue }) => {
  try {
    await trusteeService.delete(id);
    return id;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to delete trustee",
    );
  }
});
