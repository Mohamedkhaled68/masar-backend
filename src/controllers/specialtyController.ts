import { Response } from 'express';
import { Specialty } from '../models/Specialty';
import { AuthenticatedRequest } from '../types';

/**
 * Get all specialties
 * GET /specialties
 */
export const getAllSpecialties = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { active } = req.query;

    const filter: any = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const specialties = await Specialty.find(filter).sort({ nameAr: 1 });

    res.status(200).json({
      success: true,
      data: specialties,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Get specialty by ID
 * GET /specialties/:id
 */
export const getSpecialtyById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const specialty = await Specialty.findById(req.params.id);

    if (!specialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: specialty,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Create new specialty (Admin only)
 * POST /specialties
 */
export const createSpecialty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, nameAr, description, isActive } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Specialty name is required',
      });
      return;
    }

    // Check if specialty already exists
    const existingSpecialty = await Specialty.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (existingSpecialty) {
      res.status(400).json({
        success: false,
        message: 'Specialty already exists',
      });
      return;
    }

    const specialty = await Specialty.create({
      name,
      nameAr,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Specialty created successfully',
      data: specialty,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Update specialty (Admin only)
 * PUT /specialties/:id
 */
export const updateSpecialty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, nameAr, description, isActive } = req.body;

    // If name is being updated, check for duplicates
    if (name) {
      const existingSpecialty = await Specialty.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id },
      });

      if (existingSpecialty) {
        res.status(400).json({
          success: false,
          message: 'Specialty name already exists',
        });
        return;
      }
    }

    const specialty = await Specialty.findByIdAndUpdate(
      req.params.id,
      { name, nameAr, description, isActive },
      { new: true, runValidators: true }
    );

    if (!specialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Specialty updated successfully',
      data: specialty,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Delete specialty (Admin only)
 * DELETE /specialties/:id
 */
export const deleteSpecialty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const specialty = await Specialty.findByIdAndDelete(req.params.id);

    if (!specialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Specialty deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};
