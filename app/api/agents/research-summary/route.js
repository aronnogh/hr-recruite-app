// app/api/agents/research-summary/route.js
import { NextResponse } from "next/server";
import { processFileWithGemini } from "@/utils/gemini";
// ... other imports if needed for logging/auth ...

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 });

    const prompt = `
        Analyze the provided research paper. Return ONLY a single JSON object with the following keys:
        - "title": The title of the paper.
        - "authors": An array of author names.
        - "summary": A concise one-paragraph summary of the paper's abstract and introduction.
        - "keyInsights": An array of 3-5 bullet-point strings detailing the most important findings or contributions.
        - "keywords": An array of relevant keywords.
        - "conclusions": A brief summary of the paper's conclusions.
    `;
    try {
        const { structuredOutput } = await processFileWithGemini(file, prompt);
        return NextResponse.json(structuredOutput);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}