// app/api/agents/legal-simplifier/route.js
import { NextResponse } from "next/server";
import { processFileWithGemini } from "@/utils/gemini";

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 });

    const prompt = `
        Analyze the provided legal document. Return ONLY a single JSON object with the following structure:
        - "documentType": The type of legal document (e.g., "Non-Disclosure Agreement", "Terms of Service").
        - "simplifiedSummary": A one-paragraph summary of the document's main purpose in plain, simple English.
        - "keyClauses": An array of objects, where each object has "clauseTitle" (string, e.g., "Confidentiality Obligations") and "simplifiedExplanation" (string, a simple explanation of what the clause means for the user).
    `;
    try {
        const { structuredOutput } = await processFileWithGemini(file, prompt);
        return NextResponse.json(structuredOutput);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}