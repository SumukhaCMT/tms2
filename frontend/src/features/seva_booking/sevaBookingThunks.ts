import { createAsyncThunk } from "@reduxjs/toolkit";

import { sevaBookingService } from "./services/sevaBookingService";

import type {
  SevaBooking,
  CreateSevaBookingPayload,
  UpdateSevaBookingPayload,
  SevaBookingListQuery,
  SevaBookingListResult,
} from "./sevaBookingTypes";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            errors?: unknown;
          };
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

export const fetchSevaBookings = createAsyncThunk<
  SevaBookingListResult,
  SevaBookingListQuery,
  { rejectValue: string }
>(
  "sevaBooking/fetchAll",
  async (query, { rejectWithValue }) => {
    try {
      return await sevaBookingService.getAll(query);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchSevaBookingById = createAsyncThunk<
  SevaBooking,
  number,
  { rejectValue: string }
>(
  "sevaBooking/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await sevaBookingService.getById(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createSevaBooking = createAsyncThunk<
  SevaBooking,
  CreateSevaBookingPayload,
  { rejectValue: string }
>(
  "sevaBooking/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await sevaBookingService.create(payload);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateSevaBooking = createAsyncThunk<
  SevaBooking,
  { id: number; payload: UpdateSevaBookingPayload },
  { rejectValue: string }
>(
  "sevaBooking/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await sevaBookingService.update(id, payload);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteSevaBooking = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "sevaBooking/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await sevaBookingService.remove(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const printSevaBookingReceipt = createAsyncThunk<
  string,
  number,
  { rejectValue: string }
>(
  "sevaBooking/printReceipt",
  async (id, { rejectWithValue }) => {
    try {
      return await sevaBookingService.printReceipt(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);