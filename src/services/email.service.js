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
  INFO: {
    name: "Traveon Info",
    email: "info@traveon.in",
  },
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

    // 1. Set Sender (Must be verified domain/email in Brevo)
    // We use the verified env var for delivery, but use the provided name.
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName =
      emailData.sender?.name || process.env.BREVO_SENDER_NAME || "Traveon";

    if (!senderEmail) {
      throw new Error("BREVO_SENDER_EMAIL is not defined in .env");
    }

    sendSmtpEmail.sender = {
      name: senderName,
      email: senderEmail,
    };

    // 2. Set Reply-To (So replies go to info@traveon.in, not the verified sending email)
    if (emailData.sender?.email && emailData.sender.email !== senderEmail) {
      sendSmtpEmail.replyTo = {
        email: emailData.sender.email,
        name: senderName,
      };
    }

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
      }));
    }

    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      `[Email] Brevo Full Response:`,
      JSON.stringify(result, null, 2)
    );

    // Attempt to find messageID in common locations
    const messageId =
      result.messageId || (result.body && result.body.messageId);
    console.log(
      `[Email] Successfully queued to: ${emailData.to}. MessageID: ${messageId}`
    );

    return result;
  } catch (error) {
    console.error(`[Email] FAILED to ${emailData.to}. Error:`, error.message);
    if (error.response) {
      console.error(
        `[Email] Brevo Response:`,
        JSON.stringify(error.response.body)
      );
    }
  }
};
