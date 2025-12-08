/**
 * Placeholder service for WhatsApp notifications
 * In production, integrate with Twilio API or Meta Cloud API
 */

export interface WhatsAppMessage {
  to: string;
  message: string;
}

/**
 * Send WhatsApp notification to admin
 * @param adminNumber - Admin WhatsApp number
 * @param message - Message to send
 */
export const sendWhatsAppNotification = async (
  adminNumber: string,
  message: string
): Promise<void> => {
  try {
    // Placeholder: Log the message
    console.log('=== WhatsApp Notification ===');
    console.log(`To: ${adminNumber}`);
    console.log(`Message: ${message}`);
    console.log('=============================');

    // TODO: Integrate with actual WhatsApp API
    // Example with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${adminNumber}`,
      body: message
    });
    */

    // Example with Meta Cloud API (WhatsApp Business API):
    /*
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: adminNumber,
          type: 'text',
          text: { body: message }
        })
      }
    );
    const data = await response.json();
    console.log('WhatsApp message sent:', data);
    */
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    // Don't throw error - notification failure shouldn't break the main flow
  }
};

/**
 * Format teacher selection notification message
 */
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
