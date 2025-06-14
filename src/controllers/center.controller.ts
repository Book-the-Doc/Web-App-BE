import { RequestHandler } from "express";
import {
  getAllCentersService,
  deleteCenterService,
  getCenterByIdService,
  updateCenterService,
} from "../services/center.service";
import { TUpdateCenterPayload } from "../types/center.type";


/**
 * @description Get all centers' public profiles.
 * @route GET /api/centers
 * @access Public
 */
export const getAllCenters: RequestHandler = async (req, res) => {
  try {
    const centers = await getAllCentersService();
    res.json(centers);
  } catch (error: any) {
    res.status(500).json({ message: "An error occurred while fetching centers." });
  }
}

/**
 * @description Get a center's public profile by its ID.
 * @route GET /api/center/:id
 * @access Public
 */
export const getCenterById: RequestHandler = async (req, res) => {
  try {
    const center = await getCenterByIdService(req.params.id);
    if (!center) {
      res.status(404).json({ message: "Center not found" });
      return;
    }
    res.json(center);
  } catch (error: any) {
    res.status(500).json({ message: "An error occurred while fetching the center." });
  }
};

/**
 * @description Update a center's profile.
 * @route PUT /api/center/:id
 * @access Private (Owner only)
 */
export const updateCenter: RequestHandler = async (req, res) => {
  try {
    // Security check: Ensure the logged-in user's ID matches the center ID in the params.
    if (req.user?.id !== req.params.id) {
      res.status(403).json({ message: "Forbidden: You can only update your own profile." });
      return;
    }

    const center = await updateCenterService(
      req.params.id,
      req.body as TUpdateCenterPayload,
    );

    if (!center) {
      res.status(404).json({ message: "Center not found" });
      return;
    }
    res.json(center);
  } catch (error: any) {
    res.status(500).json({ message: "An error occurred while updating the center." });
  }
};

/**
 * @description Delete a center's profile.
 * @route DELETE /api/center/:id
 * @access Private (Owner only)
 */
export const deleteCenter: RequestHandler = async (req, res) => {
  try {
    // Security check: Ensure the logged-in user's ID matches the center ID in the params.
    if (req.user?.id !== req.params.id) {
        res.status(403).json({ message: "Forbidden: You can only delete your own profile." });
        return;
    }

    const center = await deleteCenterService(req.params.id);

    if (!center) {
      res.status(404).json({ message: "Center not found" });
      return;
    }
    res.json({ message: "Center deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "An error occurred while deleting the center." });
  }
};
