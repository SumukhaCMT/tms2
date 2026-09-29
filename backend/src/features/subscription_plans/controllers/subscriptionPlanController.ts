// import type { Request, Response } from "express";

// import {
//   createPlan,
//   deletePlan,
//   getPlanById,
//   getPlans,
//   updatePlan,
// } from "../services/subscriptionPlanService";

// import {
//   createSubscriptionPlanSchema,
//   subscriptionPlanIdSchema,
//   updateSubscriptionPlanSchema,
// } from "../validations/subscriptionPlanValidation";

// export const createSubscriptionPlan = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const validation =
//       createSubscriptionPlanSchema.safeParse(req.body);

//     if (!validation.success) {
//       res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: validation.error.flatten(),
//       });
//       return;
//     }

//     const plan = await createPlan(validation.data);

//     res.status(201).json({
//       success: true,
//       message: "Subscription plan created successfully",
//       data: plan,
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error
//         ? error.message
//         : "Failed to create subscription plan";

//     res.status(400).json({
//       success: false,
//       message,
//     });
//   }
// };

// export const getSubscriptionPlans = async (
//   _req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const plans = await getPlans();

//     res.status(200).json({
//       success: true,
//       data: plans,
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error
//         ? error.message
//         : "Failed to fetch subscription plans";

//     res.status(500).json({
//       success: false,
//       message,
//     });
//   }
// };

// export const getSubscriptionPlanById = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const validation = subscriptionPlanIdSchema.safeParse(
//       req.params,
//     );

//     if (!validation.success) {
//       res.status(400).json({
//         success: false,
//         message: "Invalid subscription plan ID",
//       });
//       return;
//     }

//     const plan = await getPlanById(validation.data.id);

//     res.status(200).json({
//       success: true,
//       data: plan,
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error
//         ? error.message
//         : "Failed to fetch subscription plan";

//     const status = message === "Subscription plan not found"
//       ? 404
//       : 500;

//     res.status(status).json({
//       success: false,
//       message,
//     });
//   }
// };

// export const updateSubscriptionPlan = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const idValidation =
//       subscriptionPlanIdSchema.safeParse(req.params);

//     if (!idValidation.success) {
//       res.status(400).json({
//         success: false,
//         message: "Invalid subscription plan ID",
//       });
//       return;
//     }

//     const bodyValidation =
//       updateSubscriptionPlanSchema.safeParse(req.body);

//     if (!bodyValidation.success) {
//       res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: bodyValidation.error.flatten(),
//       });
//       return;
//     }

//     const plan = await updatePlan(
//       idValidation.data.id,
//       bodyValidation.data,
//     );

//     res.status(200).json({
//       success: true,
//       message: "Subscription plan updated successfully",
//       data: plan,
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error
//         ? error.message
//         : "Failed to update subscription plan";

//     const status = message === "Subscription plan not found"
//       ? 404
//       : 400;

//     res.status(status).json({
//       success: false,
//       message,
//     });
//   }
// };

// export const deleteSubscriptionPlan = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const validation = subscriptionPlanIdSchema.safeParse(
//       req.params,
//     );

//     if (!validation.success) {
//       res.status(400).json({
//         success: false,
//         message: "Invalid subscription plan ID",
//       });
//       return;
//     }

//     await deletePlan(validation.data.id);

//     res.status(200).json({
//       success: true,
//       message: "Subscription plan deleted successfully",
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error
//         ? error.message
//         : "Failed to delete subscription plan";

//     const status = message === "Subscription plan not found"
//       ? 404
//       : 400;

//     res.status(status).json({
//       success: false,
//       message,
//     });
//   }
// };


import type { Request, Response } from "express"

import {
  createPlan,
  deletePlan,
  getPlanById,
  getPlans,
  updatePlan,
} from "../services/subscriptionPlanService"

import {
  createSubscriptionPlanSchema,
  subscriptionPlanIdSchema,
  updateSubscriptionPlanSchema,
} from "../validations/subscriptionPlanValidation"

/*
 * ================================================================
 * CREATE SUBSCRIPTION PLAN
 * ================================================================
 */

export const createSubscriptionPlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validation =
      createSubscriptionPlanSchema.safeParse(
        req.body,
      )

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      })
      return
    }

    const plan = await createPlan(
      validation.data,
    )

    res.status(201).json({
      success: true,
      message:
        "Subscription plan created successfully",
      data: plan,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create subscription plan"

    res.status(400).json({
      success: false,
      message,
    })
  }
}

/*
 * ================================================================
 * GET ALL SUBSCRIPTION PLANS
 * ================================================================
 */

export const getSubscriptionPlans = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const plans = await getPlans()

    res.status(200).json({
      success: true,
      data: plans,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch subscription plans"

    res.status(500).json({
      success: false,
      message,
    })
  }
}

/*
 * ================================================================
 * GET SUBSCRIPTION PLAN BY ID
 * ================================================================
 */

export const getSubscriptionPlanById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validation =
      subscriptionPlanIdSchema.safeParse(
        req.params,
      )

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid subscription plan ID",
      })
      return
    }

    const plan = await getPlanById(
      validation.data.id,
    )

    res.status(200).json({
      success: true,
      data: plan,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch subscription plan"

    const status =
      message === "Subscription plan not found"
        ? 404
        : 500

    res.status(status).json({
      success: false,
      message,
    })
  }
}

/*
 * ================================================================
 * UPDATE SUBSCRIPTION PLAN
 * ================================================================
 */

export const updateSubscriptionPlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    /*
     * Validate ID
     */
    const idValidation =
      subscriptionPlanIdSchema.safeParse(
        req.params,
      )

    if (!idValidation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid subscription plan ID",
      })
      return
    }

    /*
     * Validate request body
     */
    const bodyValidation =
      updateSubscriptionPlanSchema.safeParse(
        req.body,
      )

    if (!bodyValidation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          bodyValidation.error.flatten(),
      })
      return
    }

    /*
     * Update plan
     */
    const plan = await updatePlan(
      idValidation.data.id,
      bodyValidation.data,
    )

    res.status(200).json({
      success: true,
      message:
        "Subscription plan updated successfully",
      data: plan,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update subscription plan"

    const status =
      message === "Subscription plan not found"
        ? 404
        : 400

    res.status(status).json({
      success: false,
      message,
    })
  }
}

/*
 * ================================================================
 * DELETE SUBSCRIPTION PLAN
 * ================================================================
 */

export const deleteSubscriptionPlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    /*
     * Validate ID
     */
    const validation =
      subscriptionPlanIdSchema.safeParse(
        req.params,
      )

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid subscription plan ID",
      })
      return
    }

    /*
     * Delete plan
     */
    await deletePlan(validation.data.id)

    res.status(200).json({
      success: true,
      message:
        "Subscription plan deleted successfully",
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete subscription plan"

    const status =
      message === "Subscription plan not found"
        ? 404
        : 400

    res.status(status).json({
      success: false,
      message,
    })
  }
}