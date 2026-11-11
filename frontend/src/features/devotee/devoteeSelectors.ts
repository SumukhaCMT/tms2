
import type { RootState } from "@/app/store";

export const selectDevotees = (state: RootState) =>
  state.devotees.devotees;

export const selectSelectedDevotee = (state: RootState) =>
  state.devotees.selectedDevotee;

export const selectDevoteesPagination = (state: RootState) =>
  state.devotees.pagination;

export const selectDevoteesLoading = (state: RootState) =>
  state.devotees.loading;

export const selectDevoteesSubmitting = (state: RootState) =>
  state.devotees.submitting;

export const selectDevoteesError = (state: RootState) =>
  state.devotees.error;
