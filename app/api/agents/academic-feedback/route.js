// app/api/agents/academic-feedback/route.js
import { NextResponse } from "next/server";
import { processFileWithGemini } from "@/utils/gemini";

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 });

    const prompt = `
        Act as a helpful teaching assistant. Analyze the provided academic essay. Return ONLY a single JSON object with the following keys:
        - "estimatedGrade": A string representing an estimated grade (e.g., "B+", "A-").
        - "overallFeedback": A paragraph summarizing the essay's strengths and areas for improvement.
        - "grammarSuggestions": An array of objects, each with "original" (the problematic phrase) and "suggestion" (the corrected phrase).
        - "structureClarityTips": An array of strings with tips on improving the essay's structure, flow, and clarity.
    `;
    try {
        const { structuredOutput } = await processFileWithGemini(file, prompt);
        return NextResponse.json(structuredOutput);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}