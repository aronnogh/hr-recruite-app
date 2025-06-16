// app/api/agents/resume/route.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { processFileWithGemini } from "@/utils/gemini";
import dbConnect from "@/lib/mongoose";
import Resume from "@/models/Resume";
import AgentLog from "@/models/AgentLog";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'applie') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const resumeFile = formData.get('resume');

  if (!resumeFile) {
    return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 });
  }

  // UPDATED PROMPT: We now ask Gemini to do the text extraction for us.
  const resumeAnalysisPrompt = `
    First, fully extract all text content from the provided document.
    Then, analyze the extracted text and return ONLY a single JSON object.
    Do not include any introductory text, markdown formatting, or any other text outside of the JSON object.
    
    The JSON object must have these keys:
    - "fullText": A string containing the complete, extracted text from the resume.
    - "summary": A concise, professional summary of the candidate in 2-3 sentences.
    - "skills": An array of the top 10-15 technical and soft skills identified.
    - "strengths": An array of 3-4 key strengths or accomplishments highlighted in the resume.
    - "weaknesses": An array of 2-3 potential weaknesses or areas for improvement (e.g., "Lack of specific metrics in project outcomes", "No mention of leadership experience").
  `;
  
  try {
    const { parsedText, structuredOutput } = await processFileWithGemini(resumeFile, resumeAnalysisPrompt);

    if (!structuredOutput || !structuredOutput.fullText) {
      throw new Error("Failed to get structured output or full text from AI.");
    }
    
    await dbConnect();
    
    // Save the analysis to the Resume collection
    const newResume = new Resume({
      applieId: session.user.id,
      fileUrl: "TBD", // You would still upload to Vercel Blob and save the URL here
      parsedText: structuredOutput.fullText, // Use the text returned from Gemini
      analysisResult: structuredOutput,
    });
    await newResume.save();

    // Log the agent interaction
    await AgentLog.create({
        userId: session.user.id,
        agentType: 'RESUME_PARSER',
        fileName: resumeFile.name,
        rawInput: "File submitted via multimodal input.", // Input is the file itself
        aiOutput: structuredOutput,
    });

    return NextResponse.json({ 
        success: true, 
        message: 'Resume analyzed successfully.',
        resumeId: newResume._id,
        analysis: structuredOutput,
    }, { status: 200 });

  } catch (error) {
    console.error('Resume analysis failed:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}