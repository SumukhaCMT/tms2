import type { Request, Response } from "express";

import service from "../services/subscriptionBundleService";

export class SubscriptionBundleController {
  async create(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const bundleId = await service.create(req.body);

      res.status(201).json({
        success: true,
        message: "Subscription bundle created successfully",
        data: {
          id: bundleId,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create subscription bundle";

      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async getAll(
    _req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const bundles = await service.getAll();

      res.status(200).json({
        success: true,
        data: bundles,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch subscription bundles";

      res.status(500).json({
        success: false,
        message,
      });
    }
  }

  async getById(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const id = Number(req.params.id);

      const bundle = await service.getById(id);

      res.status(200).json({
        success: true,
        data: bundle,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Subscription bundle not found";

      res.status(404).json({
        success: false,
        message,
      });
    }
  }
 async update(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const id = Number(req.params.id)

      if (!Number.isInteger(id)) {
        res.status(400).json({
          success: false,
          message:
            "Invalid subscription bundle ID",
        })
        return
      }

      const bundle =
        await service.update(
          id,
          req.body,
        )

      res.status(200).json({
        success: true,
        message:
          "Subscription bundle updated successfully",
        data: bundle,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update subscription bundle"

      res.status(400).json({
        success: false,
        message,
      })
    }
  }
  async delete(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const id = Number(req.params.id);

      await service.delete(id);

      res.status(200).json({
        success: true,
        message: "Subscription bundle deleted successfully",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete subscription bundle";

      res.status(400).json({
        success: false,
        message,
      });
    }
  }
}

export default new SubscriptionBundleController();