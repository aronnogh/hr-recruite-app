// app/api/agents/meeting-summary/route.js
import { NextResponse } from "next/server";
import { processFileWithGemini } from "@/utils/gemini";

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 });

    const prompt = `
        Analyze the provided meeting transcript. Return ONLY a single JSON object with the following keys:
        - "title": A suitable title for the meeting summary.
        - "participants": An array of participant names mentioned.
        - "discussionHighlights": An array of strings, each summarizing a key topic discussed.
        - "actionItems": An array of objects, where each object has "task" (string), "assignedTo" (string), and "deadline" (string, if mentioned).
    `;
    try {
        const { structuredOutput } = await processFileWithGemini(file, prompt);
        return NextResponse.json(structuredOutput);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}