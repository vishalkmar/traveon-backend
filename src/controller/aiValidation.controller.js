import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { uploadBuffer } from "../services/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// Helper to get prompt based on document type
const getValidationPrompt = (docType) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const context = `
    Today's Date is: ${today}.
    VALIDATION RULES BASED ON DATE:
    - Expiry Dates (if any) MUST be in the FUTURE (after ${today}).
    - Issue Dates / Date of Birth MUST be in the PAST (before or on ${today}).
    - If a document has a valid 2025 or 2026 date that adheres to these rules, it is VALID.
  `;

  switch (docType) {
    case "passport":
      return `
        ${context}
        Analyze this document and determine if it is a valid PASSPORT.
        Return JSON:
        {
          "isValid": true/false,
          "confidence": (0-100),
          "issues": ["list of issues"],
          "extractedData": {
             "surname": "",
             "givenName": "",
             "passportNumber": "",
             "dateOfBirth": "",
             "dateOfExpiry": "",
             "nationality": "",
             "sex": ""
          }
        }
      `;
    case "photo":
      return `
        Analyze this image and determine if it is valid.
        VALIDATION RULES:
        1. MUST contain exactly ONE face.
        2. If there are multiple faces -> INVALID.
        3. If there are no faces -> INVALID.
        4. Background color DOES NOT MATTER (any background is clear).
        5. Lighting should be clear enough to see the face.
        6. IGNORE Metadata dates. Focus on the visual content.

        Return JSON:
        {
          "isValid": true/false,
          "confidence": (0-100),
          "issues": ["list of issues if any"],
          "extractedData": {} 
        }
      `;
    case "pan_card":
      return `
        ${context}
        Analyze this document and determine if it is a valid INDIAN PAN CARD.
        Return JSON:
        {
          "isValid": true/false,
          "confidence": (0-100),
          "issues": ["list of issues"],
          "extractedData": {
            "panNumber": "",
            "name": "",
            "fatherName": "",
            "dob": ""
          }
        }
      `;
    case "aadhar_card":
      return `
        ${context}
        Analyze this document and determine if it is a valid INDIAN AADHAR CARD.
        Return JSON:
        {
          "isValid": true/false,
          "confidence": (0-100),
          "issues": ["list of issues"],
          "extractedData": {
            "aadharNumber": "",
            "name": "",
            "dob": "",
            "gender": ""
          }
        }
      `;
    case "flight_ticket":
      return `
          ${context}
          Analyze this document and determine if it is a valid FLIGHT TICKET / ITINERARY.
          Note: Flight dates can be in the future (Upcoming travel). This is VALID.
          Return JSON:
          {
            "isValid": true/false,
            "confidence": (0-100),
            "issues": ["list of issues"],
            "extractedData": {
              "pnr": "",
              "airline": "",
              "flightNumber": "",
              "date": "",
              "passengerName": ""
            }
          }
        `;
    default:
      return `
        Analyze this document.
        Return JSON:
        {
          "isValid": true,
          "confidence": 100,
          "issues": [],
          "extractedData": {}
        }
      `;
  }
};

export const validateDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const { docType = "document" } = req.body; // e.g., 'passport', 'photo'
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    let base64Data = "";

    // Convert Buffer to Base64
    if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
      base64Data = fileBuffer.toString("base64");
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // DOCX handling
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      if (!result.value) {
        return res
          .status(400)
          .json({ success: false, message: "Empty Word document" });
      }
      base64Data = Buffer.from(result.value).toString("base64");
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported file type" });
    }

    // AI Analysis
    const prompt = getValidationPrompt(docType);
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType:
            mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ? "text/plain"
              : mimeType,
        },
      },
    ]);

    const textResponse = result.response.text();
    // cleanliness regex to extract JSON
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    let analysis = {};

    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("AI JSON Parse Error", e);
        analysis = {
          isValid: false,
          issues: ["AI Responded with invalid JSON"],
        };
      }
    } else {
      analysis = { isValid: false, issues: ["AI failed to analyze"] };
    }

    // Determine upload decision
    // Strategy: Upload if it's reasonably valid (e.g. > 50 confidence or isValid=true)
    // Or just upload always and let frontend decide?
    // User's snippet uploads and THEN returns error if invalid.

    // Upload to Cloudinary
    let cloudResult = null;
    try {
      cloudResult = await uploadBuffer(fileBuffer, "validated_docs");
    } catch (upErr) {
      console.error("Cloudinary Upload Error", upErr);
      // If upload fails, we might still want to return the validation result but usually if we can't save it, it's an error.
      return res.status(500).json({ success: false, message: "Upload failed" });
    }

    // Return Result
    // If invalid, user snippet constructs 400.
    if (
      !analysis.isValid ||
      (analysis.confidence && analysis.confidence < 60)
    ) {
      return res.status(200).json({
        // Changed to 200 so frontend can handle it gracefully? OR 400. User used 400.
        success: false,
        message: "Document validation failed",
        data: {
          analysis,
          url: cloudResult.secure_url,
          publicId: cloudResult.public_id,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document valid",
      data: {
        analysis,
        url: cloudResult.secure_url,
        publicId: cloudResult.public_id,
      },
    });
  } catch (error) {
    console.error("Validation Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Validation Server Error" });
  }
};
