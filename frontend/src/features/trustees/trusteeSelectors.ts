
import type { RootState } from "@/app/store";

export const selectTrustees = (state: RootState) => state.trustees.items;
export const selectTrusteesTotal = (state: RootState) => state.trustees.total;
export const selectTrusteesPage = (state: RootState) => state.trustees.page;
export const selectTrusteesLimit = (state: RootState) => state.trustees.limit;
export const selectTrusteesTotalPages = (state: RootState) =>
  state.trustees.totalPages;
export const selectTrusteesLoading = (state: RootState) =>
  state.trustees.loading;
export const selectTrusteeDetailLoading = (state: RootState) =>
  state.trustees.detailLoading;
export const selectTrusteeSaving = (state: RootState) => state.trustees.saving;
export const selectTrusteeDeleting = (state: RootState) =>
  state.trustees.deleting;
export const selectSelectedTrustee = (state: RootState) =>
  state.trustees.selectedTrustee;
export const selectTrusteesError = (state: RootState) => state.trustees.error;
