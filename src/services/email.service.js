import * as brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Define Sender Emails
export const EMAIL_SENDERS = {
  INFO: { name: "Traveon Info", email: "info@traveon.in" },
  OPERATIONS: {
    name: "Traveon Operations",
    email: "operations@retreatsbytraveon.in",
  },
};

/**
 * Send an email using Brevo
 * @param {Object} emailData
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML content
 * @param {string} [emailData.text] - Text content (optional)
 * @param {Object} [emailData.sender] - Sender object {name, email}
 * @param {Array} [emailData.attachments] - Array of attachments {filename, content(base64)}
 */
export const sendEmail = async (emailData) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    // Set sender (default to INFO if not provided)
    sendSmtpEmail.sender = emailData.sender || EMAIL_SENDERS.INFO;

    // Set recipients
    sendSmtpEmail.to = Array.isArray(emailData.to)
      ? emailData.to.map((email) => ({ email }))
      : [{ email: emailData.to }];

    // Set subject
    sendSmtpEmail.subject = emailData.subject;

    // Set content
    if (emailData.html) {
      sendSmtpEmail.htmlContent = emailData.html;
    } else {
      throw new Error("HTML content is required");
    }

    // Set attachments if provided
    if (emailData.attachments && emailData.attachments.length > 0) {
      sendSmtpEmail.attachment = emailData.attachments.map((att) => ({
        name: att.filename,
        content: att.content, // Base64 encoded content
        // content: att.url ? undefined : att.content, // Brevo supports URL? SDK says 'content' (base64) or 'url'. Let's stick to content if we have buffer, or url if supported.
        // For simplicity and based on user snippet, assuming content is passed.
        // If we want to send files uploaded to Cloudinary, we might just include the LINK in the body instead of attachment to save bandwidth/complexity.
      }));
    }

    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent successfully to: ${emailData.to}`);
    return result;
  } catch (error) {
    console.error("Brevo API error:", error);
    // Don't throw, just log so it doesn't block the main flow? Or throw if critical?
    // Usually email failure shouldn't crash the request, but we might want to know.
    console.error(`Failed to send email to ${emailData.to}`);
  }
};
