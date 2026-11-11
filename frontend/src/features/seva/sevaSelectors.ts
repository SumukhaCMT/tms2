
import type { RootState } from "@/app/store";

export const selectSevas = (state: RootState) =>
  state.seva.items;

export const selectSeva = (state: RootState) =>
  state.seva.selected;

export const selectSevaPagination = (state: RootState) =>
  state.seva.pagination;

export const selectSevaLoading = (state: RootState) =>
  state.seva.loading;

export const selectSevaSaving = (state: RootState) =>
  state.seva.saving;

export const selectSevaDeletingId = (state: RootState) =>
  state.seva.deletingId;

export const selectSevaError = (state: RootState) =>
  state.seva.error;
