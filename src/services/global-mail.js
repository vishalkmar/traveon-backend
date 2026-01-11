import BravoMail from "./mail";

export async function globalMailService(emailData, newData, template) {
  try {
    const result = await BravoMail(emailData, newData, template);
    console.log("📧 Email sent successfully:", result);
    return result;
  } catch (error) {
    // Surface the actual error and fail the caller
    console.error("❌ Error in globalMail:", error?.message || error);
    throw error;
  }
}