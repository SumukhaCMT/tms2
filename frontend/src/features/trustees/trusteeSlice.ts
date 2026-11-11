
import { createSlice } from "@reduxjs/toolkit";

import {
  createTrustee,
  deleteTrustee,
  fetchTrusteeById,
  fetchTrustees,
  updateTrustee,
} from "./trusteeThunks";
import type { Trustee } from "./trusteeTypes";

interface TrusteeState {
  items: Trustee[];
  selectedTrustee: Trustee | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: TrusteeState = {
  items: [],
  selectedTrustee: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
  detailLoading: false,
  saving: false,
  deleting: false,
  error: null,
};

const trusteeSlice = createSlice({
  name: "trustees",
  initialState,
  reducers: {
    clearSelectedTrustee(state) {
      state.selectedTrustee = null;
    },
    clearTrusteeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrustees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
.addCase(fetchTrustees.fulfilled, (state, action) => {
  state.loading = false;
  state.items = action.payload.data;
  state.total = action.payload.pagination.total;
  state.page = action.payload.pagination.page;
  state.limit = action.payload.pagination.limit;
  state.totalPages = action.payload.pagination.totalPages;
})
      .addCase(fetchTrustees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load trustees";
      })
      .addCase(fetchTrusteeById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
        state.selectedTrustee = null;
      })
      .addCase(fetchTrusteeById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTrustee = action.payload;
      })
      .addCase(fetchTrusteeById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload ?? "Failed to load trustee";
      })
      .addCase(createTrustee.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createTrustee.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedTrustee = action.payload;
      })
      .addCase(createTrustee.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to create trustee";
      })
      .addCase(updateTrustee.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateTrustee.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedTrustee = action.payload;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(updateTrustee.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to update trustee";
      })
      .addCase(deleteTrustee.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteTrustee.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        if (state.selectedTrustee?.id === action.payload) {
          state.selectedTrustee = null;
        }
      })
      .addCase(deleteTrustee.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload ?? "Failed to delete trustee";
      });
  },
});

export const { clearSelectedTrustee, clearTrusteeError } = trusteeSlice.actions;
export default trusteeSlice.reducer;
