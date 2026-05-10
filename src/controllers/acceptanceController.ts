import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../types.js';

export const acceptTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teacherId, notes } = req.body;

    if (!req.user || req.user.role !== 'school') {
      res.status(403).json({
        success: false,
        message: 'Only schools can accept teachers',
      });
      return;
    }

    const schoolId = req.user.userId;

    if (!teacherId) {
      res.status(400).json({
        success: false,
        message: 'Teacher ID is required',
      });
      return;
    }

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    const existingAcceptance = await prisma.acceptance.findFirst({
      where: {
        schoolId: schoolId,
        teacherId: teacherId,
      },
    });

    if (existingAcceptance) {
      res.status(400).json({
        success: false,
        message: 'You have already accepted this teacher',
        data: existingAcceptance,
      });
      return;
    }

    const acceptance = await prisma.acceptance.create({
      data: {
        schoolId: schoolId,
        teacherId: teacherId,
        notes: notes || '',
        status: 'pending',
      },
    });

    const populatedAcceptance = await prisma.acceptance.findUnique({
      where: { id: acceptance.id },
      include: {
        school: {
          select: { id: true, schoolName: true, managerName: true },
        },
        teacher: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Teacher accepted successfully',
      data: populatedAcceptance,
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

export const getSchoolAcceptances = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'school') {
      res.status(403).json({
        success: false,
        message: 'Only schools can access this endpoint',
      });
      return;
    }

    const schoolId = req.user.userId;
    const { status } = req.query;

    const filter: any = { schoolId: schoolId };
    if (status) {
      filter.status = status as any;
    }

    const acceptances = await prisma.acceptance.findMany({
      where: filter,
      include: {
        teacher: { select: { id: true, fullName: true, phoneNumber: true } },
        school: { select: { id: true, schoolName: true } },
      },
      orderBy: { acceptedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        count: acceptances.length,
        acceptances,
      },
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

export const getAllAcceptances = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint',
      });
      return;
    }

    const { status, schoolId, teacherId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status as any;
    }
    if (schoolId) {
      filter.schoolId = schoolId as string;
    }
    if (teacherId) {
      filter.teacherId = teacherId as string;
    }

    const acceptances = await prisma.acceptance.findMany({
      where: filter,
      skip,
      take: limit,
      include: {
        school: { select: { id: true, schoolName: true } },
        teacher: { select: { id: true, fullName: true, phoneNumber: true } },
      },
      orderBy: { acceptedAt: 'desc' },
    });

    const total = await prisma.acceptance.count({ where: filter });

    res.status(200).json({
      success: true,
      data: {
        acceptances,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
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

export const updateAcceptanceStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can update acceptance status',
      });
      return;
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, approved, rejected)',
      });
      return;
    }

    const statusValue = status as 'pending' | 'approved' | 'rejected';
    const acceptance = await prisma.acceptance.update({
      where: { id },
      data: { status: statusValue, notes },
      include: {
        school: { select: { id: true, schoolName: true } },
        teacher: { select: { id: true, fullName: true, phoneNumber: true } },
      },
    });

    if (!acceptance) {
      res.status(404).json({
        success: false,
        message: 'Acceptance not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Acceptance status updated successfully',
      data: acceptance,
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

export const deleteAcceptance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can delete acceptances',
      });
      return;
    }

    const { id } = req.params;

    const acceptance = await prisma.acceptance.delete({
      where: { id },
    });

    if (!acceptance) {
      res.status(404).json({
        success: false,
        message: 'Acceptance not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Acceptance deleted successfully',
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
