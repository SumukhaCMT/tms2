import {
  createPaymentMethodRepository,
  deletePaymentMethodRepository,
  getPaymentMethodByIdRepository,
  getPaymentMethodsRepository,
  updatePaymentMethodRepository,
} from "../repositories/paymentMethodRepository";

import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "../paymentMethodTypes";

export const createPaymentMethodService =
  async (
    data: CreatePaymentMethodInput
  ) => {
    return createPaymentMethodRepository(data);
  };

export const getPaymentMethodsService =
  async (
    organizationId: number
  ) => {
    return getPaymentMethodsRepository(
      organizationId
    );
  };

export const getPaymentMethodService =
  async (
    id: number,
    organizationId: number
  ) => {
    return getPaymentMethodByIdRepository(
      id,
      organizationId
    );
  };

export const updatePaymentMethodService =
  async (
    id: number,
    organizationId: number,
    data: UpdatePaymentMethodInput
  ) => {
    return updatePaymentMethodRepository(
      id,
      organizationId,
      data
    );
  };

export const deletePaymentMethodService =
  async (
    id: number,
    organizationId: number
  ) => {
    return deletePaymentMethodRepository(
      id,
      organizationId
    );
  };