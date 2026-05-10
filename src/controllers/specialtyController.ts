import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../types.js';

export const getAllSpecialties = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { active } = req.query;

    const where: any = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const specialties = await prisma.specialty.findMany({
      where,
      orderBy: { nameAr: 'asc' },
    });

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

export const getSpecialtyById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const specialty = await prisma.specialty.findUnique({
      where: { id: req.params.id },
    });

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

    const existingSpecialty = await prisma.specialty.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingSpecialty) {
      res.status(400).json({
        success: false,
        message: 'Specialty already exists',
      });
      return;
    }

    const specialty = await prisma.specialty.create({
      data: {
        name,
        nameAr,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
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

export const updateSpecialty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, nameAr, description, isActive } = req.body;

    if (name) {
      const existingSpecialty = await prisma.specialty.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          id: { not: req.params.id },
        },
      });

      if (existingSpecialty) {
        res.status(400).json({
          success: false,
          message: 'Specialty name already exists',
        });
        return;
      }
    }

    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id: req.params.id },
    });

    if (!existingSpecialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    const specialty = await prisma.specialty.update({
      where: { id: req.params.id },
      data: { name, nameAr, description, isActive },
    });

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

export const deleteSpecialty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const specialty = await prisma.specialty.findUnique({
      where: { id: req.params.id },
    });

    if (!specialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    await prisma.specialty.delete({
      where: { id: req.params.id },
    });

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
