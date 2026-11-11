import type { RootState } from "@/app/store";

export const selectSevaBookings = (state: RootState) =>
  state.sevaBooking.items;

export const selectSevaBooking = (state: RootState) =>
  state.sevaBooking.selected;

export const selectSevaBookingPagination = (state: RootState) =>
  state.sevaBooking.pagination;

export const selectSevaBookingLoading = (state: RootState) =>
  state.sevaBooking.loading;

export const selectSevaBookingSaving = (state: RootState) =>
  state.sevaBooking.saving;

export const selectSevaBookingDeletingId = (state: RootState) =>
  state.sevaBooking.deletingId;

export const selectSevaBookingError = (state: RootState) =>
  state.sevaBooking.error;