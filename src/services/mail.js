import axios from "axios";
import handlebars from "handlebars";
import fs from "fs";
const path = require("path");

const appRoot = path.resolve(__dirname);

let readHTMLFile = function (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
};

function BravoMail(
  emailData,
  replacements,
  htmlFileName = null,
  pdfBufferData = null,
  pdfFileName = null
) {
  return new Promise((resolve, reject) => {
    htmlFileName = htmlFileName ? htmlFileName : "send-otp.html";

    let filePath = appRoot + "/mail-templates/" + htmlFileName;

    readHTMLFile(filePath)
      .then(async (html) => {
        const template = handlebars.compile(html);
        const htmlSend = template(replacements);

        const senderName = process.env.MAIL_FROM_NAME;
        const senderEmail = process.env.MAIL_FROM_ADDRESS;

        const recipientEmail = emailData?.to;
        const recipientName =
          (emailData?.name && String(emailData.name).trim()) ||
          (recipientEmail ? String(recipientEmail).split("@")[0] : "Recipient");

        const payload = {
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: recipientEmail,
              name: recipientName,
            },
          ],
          subject: emailData.subject,
          htmlContent: htmlSend,
        };

        if (pdfBufferData) {
          payload.attachment = [
            {
              name: pdfFileName,
              content: pdfBufferData.toString("base64"),
            },
          ];
        }

        try {
          await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "api-key": process.env.MAIL_BREVO_API_KEY,
            },
            timeout: 15000
          });
          resolve("Email Sent via Brevo!");
        } catch (err) {
          const status = err?.response?.status;
          const data = err?.response?.data;
          const message = err?.message;
          const detail = JSON.stringify(data || {}, null, 2);
          reject(new Error(`Brevo API error ${status || ""}: ${message || ""} ${detail}`.trim()));
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export default BravoMail;