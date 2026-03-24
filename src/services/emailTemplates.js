// Escape HTML special characters to prevent injection issues
const escapeHtml = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const getBaseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f6f8; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 40px 30px; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .info-table td { padding: 12px 0; border-bottom: 1px solid #edf2f7; }
    .info-table td:first-child { font-weight: 600; color: #64748b; width: 40%; }
    .highlight { color: #4f46e5; font-weight: 600; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Traveon. All rights reserved.</p>
      <p>This is an automated message, please do not reply directly to this email for general queries.</p>
    </div>
  </div>
</body>
</html>
`;

export const contactQueryUserTemplate = (data) =>
  getBaseTemplate(
    "We Received Your Query",
    `
    <p>Hi <strong>${escapeHtml(data.name)}</strong>,</p>
    <p>Thank you for reaching out to Traveon. We have successfully received your message.</p>
    <p>Our team is currently reviewing your query regarding <span class="highlight">"${escapeHtml(data.subject)}"</span> and will get back to you as soon as possible.</p>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-top: 20px;">
      <h3 style="margin-top: 0; font-size: 16px; color: #334155;">Your Message:</h3>
      <p style="margin-bottom: 0; color: #64748b; font-style: italic;">"${escapeHtml(data.message)}"</p>
    </div>
    
    <p style="margin-top: 30px;">Best Regards,<br><strong>Team Traveon</strong></p>
  `
  );

export const contactQueryAdminTemplate = (data) =>
  getBaseTemplate(
    "New Contact Us Inquiry",
    `
    <p>Hello Admin,</p>
    <p>You have received a new inquiry from the website contact form.</p>
    
    <table class="info-table">
      <tr><td>Name:</td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td>Email:</td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
      <tr><td>Phone:</td><td>${escapeHtml(data.phone)}</td></tr>
      <tr><td>Subject:</td><td>${escapeHtml(data.subject)}</td></tr>
    </table>
    
    <h3 style="font-size: 16px; margin-top: 24px; margin-bottom: 12px;">Message:</h3>
    <div style="background-color: #f1f5f9; padding: 16px; border-left: 4px solid #4f46e5; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word;">
      ${escapeHtml(data.message)}
    </div>
  `
  );

export const tourBookingUserTemplate = (data) =>
  getBaseTemplate(
    "Tour Booking Confirmation",
    `
    <p>Hi <strong>${data.contactName}</strong>,</p>
    <p>Thank you for choosing Traveon for your upcoming adventure! Your booking request has been securely received.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Booking Reference ID</p>
      <div style="font-size: 24px; font-weight: 700; color: #333; letter-spacing: 1px; background: #eef2ff; padding: 10px 20px; border-radius: 8px; display: inline-block;">${
        data.bookingId
      }</div>
    </div>

    <table class="info-table">
      <tr><td>Travellers:</td><td>${data.numberOfTravellers} Person(s)</td></tr>
      <tr><td>Total Amount:</td><td><strong>₹${parseInt(
        data.totalAmount
      ).toLocaleString()}</strong></td></tr>
    </table>

    <p style="margin-top: 20px;">Our operations team is currently reviewing your uploaded documents. We will send you a separate confirmation email once your booking is officially approved.</p>
    
    <p>If you have any urgent questions, simply reply to this email.</p>
    
    <p style="margin-top: 30px;">Warm Regards,<br><strong>Traveon Operations</strong></p>
  `
  );

export const tourBookingAdminTemplate = (data) =>
  getBaseTemplate(
    "New Tour Booking Alert",
    `
    <p><strong>Action Required:</strong> A new tour booking has been submitted.</p>
    
    <table class="info-table">
      <tr><td>Booking ID:</td><td class="highlight">${data.bookingId}</td></tr>
      <tr><td>Contact Name:</td><td>${data.contactName}</td></tr>
      <tr><td>Email:</td><td><a href="mailto:${data.contactEmail}">${
      data.contactEmail
    }</a></td></tr>
      <tr><td>Phone:</td><td>${data.contactPhone}</td></tr>
      <tr><td>Travellers:</td><td>${data.numberOfTravellers}</td></tr>
      <tr><td>Total Amount:</td><td>₹${data.totalAmount}</td></tr>
    </table>

    <h3 style="margin-top: 24px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Traveller Details & Documents</h3>
    <div style="margin-top: 15px;">
      ${data.travellers
        .map(
          (t, i) => `
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
          <strong style="color: #334155;">#${i + 1} ${t.name}</strong>
          <div style="margin-top: 8px; font-size: 13px;">
             ${
               t.passportScanUrl
                 ? `<a href="${t.passportScanUrl}" style="color: #4f46e5; margin-right: 10px; text-decoration: none;">📄 Passport</a>`
                 : ""
             }
             ${
               t.photoUrl
                 ? `<a href="${t.photoUrl}" style="color: #4f46e5; margin-right: 10px; text-decoration: none;">📸 Photo</a>`
                 : ""
             }
             ${
               t.panCardUrl
                 ? `<a href="${t.panCardUrl}" style="color: #4f46e5; margin-right: 10px; text-decoration: none;">🆔 PAN</a>`
                 : ""
             }
             ${
               t.aadharCardUrl
                 ? `<a href="${t.aadharCardUrl}" style="color: #4f46e5; margin-right: 10px; text-decoration: none;">🆔 Aadhar</a>`
                 : ""
             }
             ${
               t.flightBookingUrl
                 ? `<a href="${t.flightBookingUrl}" style="color: #4f46e5; margin-right: 10px; text-decoration: none;">✈️ Ticket</a>`
                 : ""
             }
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `
  );

export const visaBookingUserTemplate = (data) =>
  getBaseTemplate(
    "Visa Application Received",
    `
    <p>Hi <strong>${data.contactName}</strong>,</p>
    <p>We have successfully received your visa application request. Our visa experts will begin processing your documents shortly.</p>
    
     <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Application Reference ID</p>
      <div style="font-size: 24px; font-weight: 700; color: #333; letter-spacing: 1px; background: #eef2ff; padding: 10px 20px; border-radius: 8px; display: inline-block;">${
        data.bookingId
      }</div>
    </div>

    <table class="info-table">
      <tr><td>Visa Type:</td><td class="highlight">${data.visaType}</td></tr>
      <tr><td>Applicants:</td><td>${data.numberOfTravellers}</td></tr>
      <tr><td>Total Fee:</td><td><strong>₹${parseInt(
        data.totalAmount
      ).toLocaleString()}</strong></td></tr>
    </table>

    <p style="margin-top: 20px;">We will notify you via email as soon as there is an update on your application status or if any further documents are required.</p>
    
    <p style="margin-top: 30px;">Best Regards,<br><strong>Traveon Operations</strong></p>
  `
  );

export const visaBookingAdminTemplate = (data) =>
  getBaseTemplate(
    "New Visa Application Alert",
    `
    <p><strong>Action Required:</strong> A new visa application has been submitted.</p>
    
    <table class="info-table">
      <tr><td>Application ID:</td><td class="highlight">${
        data.bookingId
      }</td></tr>
       <tr><td>Visa Type:</td><td class="highlight">${data.visaType}</td></tr>
      <tr><td>Contact Name:</td><td>${data.contactName}</td></tr>
      <tr><td>Email:</td><td><a href="mailto:${data.contactEmail}">${
      data.contactEmail
    }</a></td></tr>
      <tr><td>Phone:</td><td>${data.contactPhone}</td></tr>
      <tr><td>Applicants:</td><td>${data.numberOfTravellers}</td></tr>
      <tr><td>Total Fee:</td><td>₹${data.totalAmount}</td></tr>
    </table>

    <h3 style="margin-top: 24px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Applicant Details</h3>
    <div style="margin-top: 15px;">
      ${data.travellers
        .map(
          (t, i) => `
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
          <strong style="color: #334155;">#${i + 1} ${t.name}</strong>
          <div style="margin-top: 8px; font-size: 13px;">
             ${
               t.passportScanUrl
                 ? `<a href="${t.passportScanUrl}" style="color: #4f46e5; margin-right: 10px; text-decoration: none;">📄 Passport</a>`
                 : ""
             }
             ${
               t.photoUrl
                 ? `<a href="${t.photoUrl}" style="color: #4f46e5; margin-right: 10px; text-decoration: none;">📸 Photo</a>`
                 : ""
             }
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `
  );
