import type { RootState } from "@/app/store";

export const selectTokens = (state: RootState) =>
  state.tokens.items;

export const selectSelectedToken = (state: RootState) =>
  state.tokens.selectedToken;

export const selectTokensLoading = (state: RootState) =>
  state.tokens.loading;

export const selectTokensSaving = (state: RootState) =>
  state.tokens.saving;

export const selectTokensDeleting = (state: RootState) =>
  state.tokens.deleting;

export const selectTokenDeletingId = (state: RootState) =>
  state.tokens.deletingId;

export const selectTokensError = (state: RootState) =>
  state.tokens.error;

export const selectTokenPagination = (state: RootState) =>
  state.tokens.pagination;