import { Request, Response, NextFunction } from 'express';

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of fields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields,
      });
      return;
    }

    next();
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  // Basic validation: at least 8 digits
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6;
};

/**
 * Sanitize string input (remove extra whitespace)
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Validate teacher registration data
 */
export const validateTeacherRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    fullName,
    phoneNumber,
    password,
    nationalID,
    gender,
    age,
    address,
    academicQualification,
    specialties,
    taughtStages,
    workedInOmanBefore,
  } = req.body;

  const errors: string[] = [];

  if (!fullName) errors.push('Full name is required');
  if (!phoneNumber) errors.push('Phone number is required');
  else if (!isValidPhone(phoneNumber)) errors.push('Invalid phone number format');

  if (!password) errors.push('Password is required');
  else if (!isStrongPassword(password)) errors.push('Password must be at least 6 characters');

  if (!nationalID) errors.push('National ID is required');
  if (!gender || !['male', 'female'].includes(gender)) errors.push('Valid gender is required');
  if (!age || age < 18) errors.push('Age must be at least 18');
  if (!address) errors.push('Address is required');
  if (!academicQualification) errors.push('Academic qualification is required');
  if (!specialties || !Array.isArray(specialties) || specialties.length === 0) {
    errors.push('At least one specialty is required');
  }
  if (!taughtStages || !Array.isArray(taughtStages) || taughtStages.length === 0) {
    errors.push('Taught stages are required');
  }
  if (workedInOmanBefore === undefined) errors.push('Worked in Oman before field is required');

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};

/**
 * Validate school registration data
 */
export const validateSchoolRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    managerName,
    whatsappPhone,
    password,
    schoolName,
    schoolLocation,
    stagesNeeded,
    specialtiesNeeded,
    expectedSalaryRange,
    flightTicketProvided,
    housingProvided,
  } = req.body;

  const errors: string[] = [];

  if (!managerName) errors.push('Manager name is required');
  if (!whatsappPhone) errors.push('WhatsApp phone is required');
  else if (!isValidPhone(whatsappPhone)) errors.push('Invalid phone number format');

  if (!password) errors.push('Password is required');
  else if (!isStrongPassword(password)) errors.push('Password must be at least 6 characters');

  if (!schoolName) errors.push('School name is required');
  if (!schoolLocation) errors.push('School location is required');
  if (!stagesNeeded || !Array.isArray(stagesNeeded) || stagesNeeded.length === 0) {
    errors.push('Stages needed are required');
  }
  if (!specialtiesNeeded || !Array.isArray(specialtiesNeeded) || specialtiesNeeded.length === 0) {
    errors.push('Specialties needed are required');
  }
  if (!expectedSalaryRange) errors.push('Expected salary range is required');
  if (!flightTicketProvided || !['full', 'half', 'none'].includes(flightTicketProvided)) {
    errors.push('Valid flight ticket provision is required');
  }
  if (housingProvided === undefined) errors.push('Housing provision field is required');

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};
