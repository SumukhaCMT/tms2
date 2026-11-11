
import type { RootState } from "@/app/store";

export const selectDeities = (state: RootState) =>
  state.deities.items;

export const selectSelectedDeity = (state: RootState) =>
  state.deities.selectedDeity;

export const selectDeitiesLoading = (state: RootState) =>
  state.deities.loading;

export const selectDeitiesSaving = (state: RootState) =>
  state.deities.saving;

export const selectDeitiesDeleting = (state: RootState) =>
  state.deities.deleting;

export const selectDeitiesError = (state: RootState) =>
  state.deities.error;