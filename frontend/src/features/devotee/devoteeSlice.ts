



import { createSlice } from "@reduxjs/toolkit";
import type { DevoteeState } from "./devoteeTypes";

import {
  deleteDevotee,
  fetchDevoteeById,
  fetchDevotees,
  searchDevotees,
  updateDevotee,
} from "./devoteeThunks";

const initialState: DevoteeState = {
  devotees: [],
  selectedDevotee: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  submitting: false,
  error: null,
};

const devoteeSlice = createSlice({
  name: "devotees",
  initialState,
  reducers: {
    clearSelectedDevotee(state) {
      state.selectedDevotee = null;
    },
    clearDevoteeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all devotees
      .addCase(fetchDevotees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevotees.fulfilled, (state, action) => {
        state.loading = false;
        state.devotees = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDevotees.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed to load devotees.");
      })

      // Fetch devotee by ID
      .addCase(fetchDevoteeById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedDevotee = null;
      })
      .addCase(fetchDevoteeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDevotee = action.payload;
      })
      .addCase(fetchDevoteeById.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Devotee not found.");
      })

      // Search devotees
      .addCase(searchDevotees.fulfilled, (state, action) => {
        state.devotees = action.payload;
      })
      .addCase(searchDevotees.rejected, (state, action) => {
        state.error = String(action.payload || "Search failed.");
      })

      // Update devotee
      .addCase(updateDevotee.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateDevotee.fulfilled, (state, action) => {
        state.submitting = false;
        state.selectedDevotee = action.payload;

        const index = state.devotees.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.devotees[index] = action.payload;
        }
      })
      .addCase(updateDevotee.rejected, (state, action) => {
        state.submitting = false;
        state.error = String(action.payload || "Failed to update devotee.");
      })

      // Delete devotee
      .addCase(deleteDevotee.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteDevotee.fulfilled, (state, action) => {
        state.devotees = state.devotees.filter(
          (devotee) => devotee.id !== action.payload,
        );

        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1,
        );

        state.pagination.totalPages = Math.ceil(
          state.pagination.total / state.pagination.limit,
        );
      })
      .addCase(deleteDevotee.rejected, (state, action) => {
        state.error = String(action.payload || "Failed to delete devotee.");
      });
  },
});

export const { clearSelectedDevotee, clearDevoteeError } =
  devoteeSlice.actions;

export default devoteeSlice.reducer;
