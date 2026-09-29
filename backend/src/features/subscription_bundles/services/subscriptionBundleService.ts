import repository from "../repositories/subscriptionBundleRepository";

import type {
  CreateSubscriptionBundlePayload,
  UpdateSubscriptionBundlePayload,
} from "../subscriptionBundleTypes";

export class SubscriptionBundleService {
  async create(payload: CreateSubscriptionBundlePayload) {
    const nameExists = await repository.isNameExists(
      payload.bundle_name,
    );

    if (nameExists) {
      throw new Error("Bundle name already exists");
    }

    const codeExists = await repository.isCodeExists(
      payload.bundle_code,
    );

    if (codeExists) {
      throw new Error("Bundle code already exists");
    }

    const uniquePlanIds = [...new Set(payload.plan_ids)];

    if (uniquePlanIds.length === 0) {
      throw new Error(
        "At least one plan must be selected",
      );
    }

    return repository.create({
      ...payload,
      plan_ids: uniquePlanIds,
    });
  }

  async getAll() {
    return repository.findAll();
  }

  async getById(id: number) {
    const bundle = await repository.findById(id);

    if (!bundle) {
      throw new Error("Subscription bundle not found");
    }

    return bundle;
  }
async update(
    id: number,
    payload: UpdateSubscriptionBundlePayload,
  ) {
    const existing =
      await repository.findById(id)

    if (!existing) {
      throw new Error(
        "Subscription bundle not found",
      )
    }

    if (
      payload.bundle_name !== undefined
    ) {
      const nameExists =
        await repository.isNameExists(
          payload.bundle_name,
          id,
        )

      if (nameExists) {
        throw new Error(
          "Bundle name already exists",
        )
      }
    }

    if (
      payload.bundle_code !== undefined
    ) {
      const codeExists =
        await repository.isCodeExists(
          payload.bundle_code,
          id,
        )

      if (codeExists) {
        throw new Error(
          "Bundle code already exists",
        )
      }
    }

    const planIds =
      payload.plan_ids !== undefined
        ? [
            ...new Set(
              payload.plan_ids.map(Number),
            ),
          ]
        : undefined

    if (
      planIds !== undefined &&
      planIds.length === 0
    ) {
      throw new Error(
        "At least one plan must be selected",
      )
    }

    const updatePayload: UpdateSubscriptionBundlePayload =
      {
        ...payload,

        ...(payload.bundle_price !==
        undefined
          ? {
              bundle_price: Number(
                payload.bundle_price,
              ),
            }
          : {}),

        ...(payload.bundle_gst_percentage !==
        undefined
          ? {
              bundle_gst_percentage:
                Number(
                  payload.bundle_gst_percentage,
                ),
            }
          : {}),

        ...(payload.bundle_total_price !==
        undefined
          ? {
              bundle_total_price: Number(
                payload.bundle_total_price,
              ),
            }
          : {}),

        ...(payload.bundle_duration_months !==
        undefined
          ? {
              bundle_duration_months:
                payload.bundle_duration_months ===
                null
                  ? null
                  : Number(
                      payload.bundle_duration_months,
                    ),
            }
          : {}),

        ...(payload.bundle_amc_price !==
        undefined
          ? {
              bundle_amc_price:
                payload.bundle_amc_price ===
                null
                  ? null
                  : Number(
                      payload.bundle_amc_price,
                    ),
            }
          : {}),

        ...(payload.bundle_amc_duration_months !==
        undefined
          ? {
              bundle_amc_duration_months:
                payload.bundle_amc_duration_months ===
                null
                  ? null
                  : Number(
                      payload.bundle_amc_duration_months,
                    ),
            }
          : {}),

        ...(payload.bundle_amc_gst_percentage !==
        undefined
          ? {
              bundle_amc_gst_percentage:
                payload.bundle_amc_gst_percentage ===
                null
                  ? null
                  : Number(
                      payload.bundle_amc_gst_percentage,
                    ),
            }
          : {}),

        ...(planIds !== undefined
          ? {
              plan_ids: planIds,
            }
          : {}),
      }

    await repository.update(
      id,
      updatePayload,
    )

    return repository.findById(id)
  }

  async delete(id: number) {
    const bundle = await repository.findById(id);

    if (!bundle) {
      throw new Error("Subscription bundle not found");
    }

    await repository.delete(id);
  }
}

export default new SubscriptionBundleService();