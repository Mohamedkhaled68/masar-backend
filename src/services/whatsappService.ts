export interface WhatsAppMessage {
  to: string;
  message: string;
}

export const sendWhatsAppNotification = async (
  adminNumber: string,
  message: string
): Promise<void> => {
  try {
    console.log('=== WhatsApp Notification ===');
    console.log(`To: ${adminNumber}`);
    console.log(`Message: ${message}`);
    console.log('=============================');
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
  }
};

export const formatTeacherSelectionMessage = (
  schoolName: string,
  teacherName: string,
  teacherId: string
): string => {
  return `🎓 New Teacher Selection!

School: ${schoolName}
Teacher: ${teacherName}
Teacher ID: ${teacherId}

A school has accepted a teacher. Please review in the admin panel.`;
};
