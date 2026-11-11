
import { createSlice } from "@reduxjs/toolkit";

import type { Deity } from "./deityTypes";

import { createDeity, deleteDeity, fetchDeities, fetchDeityById, updateDeity,} from "./deityThunks";

interface DeityState {
  items: Deity[];
  selectedDeity: Deity | null;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: DeityState = {
  items: [],
  selectedDeity: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
};

const deitySlice = createSlice({
  name: "deities",
  initialState,
  reducers: {
    clearSelectedDeity(state) {
      state.selectedDeity = null;
    },
    clearDeityError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDeities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load deities";
      })

      .addCase(fetchDeityById.pending, (state) => {
        state.loading = true;
        state.selectedDeity = null;
        state.error = null;
      })
      .addCase(fetchDeityById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDeity = action.payload;
      })
      .addCase(fetchDeityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load deity";
      })

      .addCase(createDeity.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createDeity.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createDeity.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to create deity";
      })

      .addCase(updateDeity.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateDeity.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedDeity = action.payload;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateDeity.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to update deity";
      })

      .addCase(deleteDeity.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDeity.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(deleteDeity.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload ?? "Failed to delete deity";
      });
  },
});

export const { clearSelectedDeity, clearDeityError } =
  deitySlice.actions;

export default deitySlice.reducer;