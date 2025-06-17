// utils/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * Creates a Gemini client instance with a specific API key.
 * @param {string} apiKey The user-provided Gemini API key.
 * @returns {import("@google/generative-ai").GenerativeModel}
 */
function getClient(apiKey, modelName = "gemini-pro") {
    if (!apiKey) {
        throw new Error("A Gemini API Key is required for this operation.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Sends a file directly to the Gemini API for parsing and analysis using a specific API key.
 * @param {File} file The file object to send.
 * @param {string} prompt The text prompt.
 * @param {string} apiKey The HR user's Gemini API key.
 * @returns {Promise<{parsedText: string, structuredOutput: object | null}>}
 */
export async function processFileWithUserKey(file, prompt, apiKey) {
  // Use a model that supports file inputs
  const model = getClient(apiKey, "gemini-1.5-flash-latest");
  
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const filePart = {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: file.type,
    },
  };

  const result = await model.generateContent([prompt, filePart]);
  const response = result.response;
  const aiResponseText = response.text();
  const structuredOutput = extractJson(aiResponseText);
  const parsedText = structuredOutput?.fullText || aiResponseText;

  if (!structuredOutput) {
      console.warn("Gemini did not return a structured JSON object. The response was:", aiResponseText);
  }
  
  return { parsedText, structuredOutput };
}

/**
 * Sends a text-only prompt to the Gemini API using a specific API key.
 * @param {string} prompt The complete text prompt.
 * @param {string} apiKey The HR user's Gemini API key.
 * @returns {Promise<{textResponse: string, structuredOutput: object | null}>}
 */
export async function generateTextWithUserKey(prompt, apiKey) {
    const model = getClient(apiKey, "gemini-1.5-flash-latest"); // A text model is sufficient and cheaper
    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();
    const structuredOutput = extractJson(textResponse);
  
    return { textResponse, structuredOutput };
}