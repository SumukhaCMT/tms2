import type { RootState } from "@/app/store";

export const selectTemples = (state: RootState) =>
  state.temples.temples;

export const selectSelectedTemple = (state: RootState) =>
  state.temples.selectedTemple;

export const selectTempleLoading = (state: RootState) =>
  state.temples.loading;

export const selectTempleDetailsLoading = (
  state: RootState,
) => state.temples.detailsLoading;

export const selectTempleSaving = (state: RootState) =>
  state.temples.saving;

export const selectTempleDeleting = (state: RootState) =>
  state.temples.deleting;

export const selectTempleError = (state: RootState) =>
  state.temples.error;

export const selectTempleDetailsError = (
  state: RootState,
) => state.temples.detailsError;