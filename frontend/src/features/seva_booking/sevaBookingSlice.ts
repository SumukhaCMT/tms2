import { createSlice } from "@reduxjs/toolkit";

import {
  fetchSevaBookings,
  fetchSevaBookingById,
  createSevaBooking,
  updateSevaBooking,
  deleteSevaBooking,
} from "./sevaBookingThunks";

import type {
  SevaBooking,
  PaginationMeta,
} from "./sevaBookingTypes";

interface SevaBookingState {
  items: SevaBooking[];
  selected: SevaBooking | null;
  pagination: PaginationMeta;
  loading: boolean;
  saving: boolean;
  deletingId: number | null;
  error: string | null;
}

const initialState: SevaBookingState = {
  items: [],
  selected: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loading: false,
  saving: false,
  deletingId: null,
  error: null,
};

const sevaBookingSlice = createSlice({
  name: "sevaBooking",
  initialState,

  reducers: {
    clearSelectedSevaBooking(state) {
      state.selected = null;
    },

    clearSevaBookingError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchSevaBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSevaBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSevaBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load bookings.";
      })

      // FETCH BY ID
      .addCase(fetchSevaBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(fetchSevaBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchSevaBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load booking.";
      })

      // CREATE
      .addCase(createSevaBooking.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createSevaBooking.fulfilled, (state, action) => {
        state.saving = false;
        state.selected = action.payload;
      })
      .addCase(createSevaBooking.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to create booking.";
      })

      // UPDATE
      .addCase(updateSevaBooking.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateSevaBooking.fulfilled, (state, action) => {
        state.saving = false;
        state.selected = action.payload;
      })
      .addCase(updateSevaBooking.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to update booking.";
      })

      // DELETE
      .addCase(deleteSevaBooking.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteSevaBooking.fulfilled, (state, action) => {
        state.deletingId = null;

        state.items = state.items.filter(
          (item) => item.id !== action.payload,
        );

        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1,
        );

        state.pagination.totalPages = Math.ceil(
          state.pagination.total / state.pagination.limit,
        );
      })
      .addCase(deleteSevaBooking.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload ?? "Failed to delete booking.";
      });
  },
});

export const {
  clearSelectedSevaBooking,
  clearSevaBookingError,
} = sevaBookingSlice.actions;

export default sevaBookingSlice.reducer;