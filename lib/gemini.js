import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Converts a file buffer to a Gemini-compatible FilePart.
 * @param {Buffer} buffer The file buffer.
 * @param {string} mimeType The MIME type of the file.
 * @returns {import("@google/generative-ai").Part}
 */
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

/**
 * Runs a generative model with a prompt and optional file parts.
 * @param {string} prompt The text prompt.
 * @param {Array<import("@google/generative-ai").Part>} fileParts Array of file parts.
 * @returns {Promise<string>} The generated text.
 */
export async function runGemini(prompt, fileParts = []) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const parts = [prompt, ...fileParts];
  
  const result = await model.generateContent({ contents: [{ role: "user", parts }]});
  const response = await result.response;
  return response.text();
}

export { fileToGenerativePart };