import { Request } from 'express';

export type UserRole = 'admin' | 'teacher' | 'school';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface TeacherData {
  fullName: string;
  phoneNumber: string;
  password: string;
  nationalID: string;
  gender: 'male' | 'female';
  age: number;
  address: string;
  academicQualification: string;
  diploma?: string;
  courses?: string[];
  taughtStages: string[];
  workedInOmanBefore: boolean;
}

export interface SchoolData {
  managerName: string;
  whatsappPhone: string;
  password: string;
  schoolName: string;
  schoolLocation: string;
  stagesNeeded: string[];
  specialtiesNeeded: string[];
  expectedSalaryRange: string;
  flightTicketProvided: 'full' | 'half' | 'none';
  housingProvided: boolean;
  housingAllowance?: string | number;
}

export interface LoginRequest {
  phoneNumber?: string;
  email?: string;
  password: string;
}

export interface VideoUpload {
  title: string;
  teacherId: string;
}

export interface SelectionRequest {
  schoolId: string;
  teacherId: string;
  videoId?: string;
}
