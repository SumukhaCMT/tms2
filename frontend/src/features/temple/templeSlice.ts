import { createSlice } from "@reduxjs/toolkit";

import {
  fetchTemples,
  fetchTemple,
  createTemple,
  updateTemple,
  deleteTemple,
} from "./templeThunks";

import type { Temple } from "./templeTypes";

interface TempleState {
  temples: Temple[];

  selectedTemple: Temple | null;

  loading: boolean;
  detailsLoading: boolean;
  saving: boolean;
  deleting: boolean;

  error: string | null;
  detailsError: string | null;
}

const initialState: TempleState = {
  temples: [],

  selectedTemple: null,

  loading: false,
  detailsLoading: false,
  saving: false,
  deleting: false,

  error: null,
  detailsError: null,
};

const templeSlice = createSlice({
  name: "temples",

  initialState,

  reducers: {
    clearTempleError: (state) => {
      state.error = null;
    },

    clearTempleDetailsError: (state) => {
      state.detailsError = null;
    },

    clearSelectedTemple: (state) => {
      state.selectedTemple = null;
    },
  },

  extraReducers: (builder) => {
    // GET ALL
    builder
      .addCase(fetchTemples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTemples.fulfilled, (state, action) => {
        state.loading = false;
        state.temples = action.payload;
      })

      .addCase(fetchTemples.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch temples";
      });

    // GET ONE
    builder
      .addCase(fetchTemple.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })

      .addCase(fetchTemple.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedTemple = action.payload;
      })

      .addCase(fetchTemple.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || "Failed to fetch temple";
      });

    // CREATE
    builder
      .addCase(createTemple.pending, (state) => {
        state.saving = true;
        state.error = null;
      })

      .addCase(createTemple.fulfilled, (state, action) => {
        state.saving = false;

        state.temples.push(action.payload);
      })

      .addCase(createTemple.rejected, (state, action) => {
        state.saving = false;

        state.error =
          action.payload || "Failed to create temple";
      });

    // UPDATE
    builder
      .addCase(updateTemple.pending, (state) => {
        state.saving = true;
        state.error = null;
      })

      .addCase(updateTemple.fulfilled, (state, action) => {
        state.saving = false;

        const index = state.temples.findIndex(
          (temple) => temple.id === action.payload.id,
        );

        if (index !== -1) {
          state.temples[index] = action.payload;
        }

        state.selectedTemple = action.payload;
      })

      .addCase(updateTemple.rejected, (state, action) => {
        state.saving = false;

        state.error =
          action.payload || "Failed to update temple";
      });

    // DELETE
    builder
      .addCase(deleteTemple.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })

      .addCase(deleteTemple.fulfilled, (state, action) => {
        state.deleting = false;

        state.temples = state.temples.filter(
          (temple) => temple.id !== action.payload,
        );

        if (state.selectedTemple?.id === action.payload) {
          state.selectedTemple = null;
        }
      })

      .addCase(deleteTemple.rejected, (state, action) => {
        state.deleting = false;

        state.error =
          action.payload || "Failed to delete temple";
      });
  },
});

export const {
  clearTempleError,
  clearTempleDetailsError,
  clearSelectedTemple,
} = templeSlice.actions;

export default templeSlice.reducer;