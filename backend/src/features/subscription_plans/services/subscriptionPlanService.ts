import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  findAllSubscriptionPlans,
  findSubscriptionPlanByCode,
  findSubscriptionPlanById,
  updateSubscriptionPlan,
} from "../repositories/subscriptionPlanRepository";

import type {
  CreateSubscriptionPlanPayload,
  UpdateSubscriptionPlanPayload,
} from "../subscriptionPlanTypes";

export const createPlan = async (
  data: CreateSubscriptionPlanPayload,
) => {
  const existingPlan = await findSubscriptionPlanByCode(data.plan_code);

  if (existingPlan) {
    throw new Error("Subscription plan code already exists");
  }

  const totalPrice =
    data.plan_total_price ??
    data.plan_price +
      (data.plan_price * data.plan_gst_percentage) / 100;

  return createSubscriptionPlan({
    ...data,
    plan_total_price: Number(totalPrice.toFixed(2)),
  });
};

export const getPlans = async () => {
  return findAllSubscriptionPlans();
};

export const getPlanById = async (id: number) => {
  const plan = await findSubscriptionPlanById(id);

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  return plan;
};

export const updatePlan = async (
  id: number,
  data: UpdateSubscriptionPlanPayload,
) => {
  const existingPlan = await findSubscriptionPlanById(id);

  if (!existingPlan) {
    throw new Error("Subscription plan not found");
  }

  if (
    data.plan_code &&
    data.plan_code !== existingPlan.plan_code
  ) {
    const duplicatePlan = await findSubscriptionPlanByCode(
      data.plan_code,
    );

    if (duplicatePlan && duplicatePlan.id !== id) {
      throw new Error("Subscription plan code already exists");
    }
  }

  let updateData = { ...data };

  if (
    data.plan_price !== undefined ||
    data.plan_gst_percentage !== undefined
  ) {
    const price = data.plan_price ?? existingPlan.plan_price;
    const gst =
      data.plan_gst_percentage ??
      existingPlan.plan_gst_percentage;

    const totalPrice = price + (price * gst) / 100;

    updateData = {
      ...updateData,
      plan_total_price: Number(totalPrice.toFixed(2)),
    };
  }

  return updateSubscriptionPlan(id, updateData);
};

export const deletePlan = async (id: number) => {
  const existingPlan = await findSubscriptionPlanById(id);

  if (!existingPlan) {
    throw new Error("Subscription plan not found");
  }

  return deleteSubscriptionPlan(id);
};