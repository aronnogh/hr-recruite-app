// utils/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use a model that supports file inputs, like gemini-1.5-pro
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

/**
 * A utility to extract JSON from a string that might contain markdown.
 * Gemini often returns JSON wrapped in ```json ... ```.
 * @param {string} str The string to parse.
 * @returns {object | null} The parsed JSON object or null if parsing fails.
 */
function extractJson(str) {
  const match = str.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error('Failed to parse JSON from Gemini response:', e);
      return null;
    }
  }
  // Fallback for cases where Gemini returns raw JSON
  try {
    return JSON.parse(str);
  } catch (e) {
    return null; // Not a JSON string
  }
}

/**
 * Sends a file directly to the Gemini API for parsing and analysis.
 * @param {File} file The file object (PDF, DOCX, TXT) to send.
 * @param {string} prompt The text prompt instructing Gemini what to do.
 * @returns {Promise<{parsedText: string, structuredOutput: object | null}>}
 */
export async function processFileWithGemini(file, prompt) {
  // 1. Convert the file to a GoogleGenerativeAI.Part object.
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const filePart = {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: file.type,
    },
  };

  // 2. Send the file and the text prompt to Gemini.
  // The model processes the contents of `filePart` and uses the `prompt` for instructions.
  const result = await model.generateContent([prompt, filePart]);
  const response = result.response;
  const aiResponseText = response.text();

  // 3. Extract the structured JSON from the response text.
  const structuredOutput = extractJson(aiResponseText);
  
  // The full text might be part of the structured output if we ask for it,
  // or we can fall back to the raw response.
  const parsedText = structuredOutput?.fullText || aiResponseText;

  if (!structuredOutput) {
      console.warn("Gemini did not return a structured JSON object. The response was:", aiResponseText);
  }

  return { parsedText, structuredOutput };
}