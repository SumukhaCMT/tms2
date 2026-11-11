
import { createAsyncThunk } from "@reduxjs/toolkit";

import { createDeityApi, deleteDeityApi, getDeitiesApi, getDeityByIdApi, updateDeityApi,} from "./services/deityServices";
import type { CreateDeityPayload, Deity, UpdateDeityPayload,} from "./deityTypes";
const getErrorMessage = (error: unknown): string => {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    err.response?.data?.message ??
    err.message ??
    "Something went wrong"
  );
};

export const fetchDeities = createAsyncThunk<
  Deity[],
  void,
  { rejectValue: string }
>("deities/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await getDeitiesApi();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchDeityById = createAsyncThunk<
  Deity,
  number,
  { rejectValue: string }
>("deities/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await getDeityByIdApi(id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createDeity = createAsyncThunk<
  Deity,
  CreateDeityPayload,
  { rejectValue: string }
>("deities/create", async (payload, { rejectWithValue }) => {
  try {
    return await createDeityApi(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateDeity = createAsyncThunk<
  Deity,
  { id: number; data: UpdateDeityPayload },
  { rejectValue: string }
>("deities/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateDeityApi(id, data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteDeity = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("deities/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteDeityApi(id);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});