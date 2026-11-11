

import { createSlice } from "@reduxjs/toolkit";

import {
  createToken,
  createTokenIssue,
  deleteToken,
  fetchTokenById,
  fetchTokens,
  updateToken,
} from "./tokenThunks";

import type { TokenState } from "./tokenTypes";

const initialState: TokenState = {
  items: [],
  selectedToken: null,
  loading: false,
  saving: false,
  deleting: false,
  deletingId: null,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

const tokenSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    clearSelectedToken(state) {
      state.selectedToken = null;
    },
    clearTokenError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch master tokens
      .addCase(fetchTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokens.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTokens.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch tokens.";
      })

      // Fetch one master token
      .addCase(fetchTokenById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedToken = action.payload;
      })
      .addCase(fetchTokenById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch token.";
      })

      // Create a master token
      .addCase(createToken.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createToken.fulfilled, (state, action) => {
        state.saving = false;

        const exists = state.items.some(
          (token) => token.id === action.payload.id,
        );

        if (!exists && state.pagination.page === 1) {
          state.items.unshift(action.payload);
          state.pagination.total += 1;
          state.pagination.totalPages = Math.max(
            1,
            Math.ceil(state.pagination.total / state.pagination.limit),
          );

          if (state.items.length > state.pagination.limit) {
            state.items.pop();
          }
        }
      })
      .addCase(createToken.rejected, (state, action) => {
        state.saving = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to create token.";
      })

      // Issue an existing token
      .addCase(createTokenIssue.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createTokenIssue.fulfilled, (state) => {
        state.saving = false;
        // Do not add this response to the master-token list.
      })
      .addCase(createTokenIssue.rejected, (state, action) => {
        state.saving = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to issue token.";
      })

      // Update a master token
      .addCase(updateToken.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateToken.fulfilled, (state, action) => {
        state.saving = false;

        state.items = state.items.map((token) =>
          token.id === action.payload.id ? action.payload : token,
        );

        if (state.selectedToken?.id === action.payload.id) {
          state.selectedToken = action.payload;
        }
      })
      .addCase(updateToken.rejected, (state, action) => {
        state.saving = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to update token.";
      })

      // Delete a master token
      .addCase(deleteToken.pending, (state, action) => {
        state.deleting = true;
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteToken.fulfilled, (state, action) => {
        state.deleting = false;
        state.deletingId = null;

        state.items = state.items.filter(
          (token) => token.id !== action.payload,
        );

        if (state.selectedToken?.id === action.payload) {
          state.selectedToken = null;
        }

        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.pagination.totalPages = Math.max(
          1,
          Math.ceil(state.pagination.total / state.pagination.limit),
        );
      })
      .addCase(deleteToken.rejected, (state, action) => {
        state.deleting = false;
        state.deletingId = null;
        state.error =
          action.payload ?? action.error.message ?? "Failed to delete token.";
      });
  },
});

export const { clearSelectedToken, clearTokenError } = tokenSlice.actions;

export default tokenSlice.reducer;