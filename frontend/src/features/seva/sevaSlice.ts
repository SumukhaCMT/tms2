
import { createSlice } from "@reduxjs/toolkit";

import {
  fetchSevas,
  fetchSevaById,
  createSeva,
  updateSeva,
  deleteSeva,
} from "./sevaThunks";

import type { Seva, PaginationMeta } from "./sevaTypes";

interface SevaState {
  items: Seva[];
  selected: Seva | null;
  pagination: PaginationMeta;
  loading: boolean;
  saving: boolean;
  deletingId: number | null;
  error: string | null;
}

const initialState: SevaState = {
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

const sevaSlice = createSlice({
  name: "seva",
  initialState,
  reducers: {
    clearSelectedSeva(state) {
      state.selected = null;
    },
    clearSevaError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSevas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSevas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSevas.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to load Sevas.";
      })

      .addCase(fetchSevaById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(fetchSevaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchSevaById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to load Seva.";
      })

      .addCase(createSeva.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createSeva.fulfilled, (state, action) => {
        state.saving = false;
        state.selected = action.payload;
      })
      .addCase(createSeva.rejected, (state, action) => {
        state.saving = false;
        state.error =
          action.payload ?? "Failed to create Seva.";
      })

      .addCase(updateSeva.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateSeva.fulfilled, (state, action) => {
        state.saving = false;
        state.selected = action.payload;
      })
      .addCase(updateSeva.rejected, (state, action) => {
        state.saving = false;
        state.error =
          action.payload ?? "Failed to update Seva.";
      })

      .addCase(deleteSeva.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteSeva.fulfilled, (state, action) => {
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
      .addCase(deleteSeva.rejected, (state, action) => {
        state.deletingId = null;
        state.error =
          action.payload ?? "Failed to delete Seva.";
      });
  },
});

export const { clearSelectedSeva, clearSevaError } =
  sevaSlice.actions;

export default sevaSlice.reducer;
