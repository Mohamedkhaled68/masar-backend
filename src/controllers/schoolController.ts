import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../types.js';

export const getAllSchools = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const schools = await prisma.school.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        managerName: true,
        whatsappPhone: true,
        schoolName: true,
        schoolLocation: true,
        stagesNeeded: true,
        specialtiesNeeded: true,
        expectedSalaryRange: true,
        flightTicketProvided: true,
        housingProvided: true,
        housingAllowance: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        selectedTeachers: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            nationalID: true,
            gender: true,
            age: true,
            address: true,
            academicQualification: true,
            diploma: true,
            courses: true,
            taughtStages: true,
            workedInOmanBefore: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            specialties: { select: { id: true } },
            videos: { select: { id: true } },
          },
        },
      },
    });

    const total = await prisma.school.count();

    const schoolsData = (schools as any[]).map((school) => ({
      ...school,
      selectedTeachers: (school.selectedTeachers as any[]).map((teacher) => ({
        ...teacher,
        specialties: (teacher.specialties as any[]).map((specialty: any) => specialty.id),
        videos: (teacher.videos as any[]).map((video: any) => video.id),
      })),
    }));

    res.status(200).json({
      success: true,
      data: {
        schools: schoolsData,
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

export const getSchoolById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        managerName: true,
        whatsappPhone: true,
        schoolName: true,
        schoolLocation: true,
        stagesNeeded: true,
        specialtiesNeeded: true,
        expectedSalaryRange: true,
        flightTicketProvided: true,
        housingProvided: true,
        housingAllowance: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        selectedTeachers: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            nationalID: true,
            gender: true,
            age: true,
            address: true,
            academicQualification: true,
            diploma: true,
            courses: true,
            taughtStages: true,
            workedInOmanBefore: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            specialties: { select: { id: true } },
            videos: { select: { id: true } },
          },
        },
      },
    });

    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    const schoolData = {
      ...school,
      selectedTeachers: (school.selectedTeachers as any[]).map((teacher) => ({
        ...teacher,
        specialties: (teacher.specialties as any[]).map((specialty: any) => specialty.id),
        videos: (teacher.videos as any[]).map((video: any) => video.id),
      })),
    };

    res.status(200).json({
      success: true,
      data: schoolData,
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

export const updateSchool = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const schoolId = req.params.id;

    if (req.user?.role === 'school' && req.user.userId !== schoolId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
      return;
    }

    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.role;
    delete updateData.whatsappPhone;
    delete updateData.selectedTeachers; // Managed through selection flow

    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!existingSchool) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: updateData,
      select: {
        id: true,
        managerName: true,
        whatsappPhone: true,
        schoolName: true,
        schoolLocation: true,
        stagesNeeded: true,
        specialtiesNeeded: true,
        expectedSalaryRange: true,
        flightTicketProvided: true,
        housingProvided: true,
        housingAllowance: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        selectedTeachers: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            nationalID: true,
            gender: true,
            age: true,
            address: true,
            academicQualification: true,
            diploma: true,
            courses: true,
            taughtStages: true,
            workedInOmanBefore: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            specialties: { select: { id: true } },
            videos: { select: { id: true } },
          },
        },
      },
    });
    const schoolData = {
      ...school,
      selectedTeachers: (school.selectedTeachers as any[]).map((teacher) => ({
        ...teacher,
        specialties: (teacher.specialties as any[]).map((specialty: any) => specialty.id),
        videos: (teacher.videos as any[]).map((video: any) => video.id),
      })),
    };

    res.status(200).json({
      success: true,
      message: 'School profile updated successfully',
      data: schoolData,
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

export const deleteSchool = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
    });

    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    await prisma.school.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'School deleted successfully',
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
