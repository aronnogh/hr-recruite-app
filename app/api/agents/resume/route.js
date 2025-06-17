// app/api/agents/resume/route.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { processFileWithUserKey } from "@/utils/gemini";
import dbConnect from "@/lib/mongoose";
import Resume from "@/models/Resume";
import AgentLog from "@/models/AgentLog";
import JobDescription from "@/models/JobDescription";
import User from "@/models/User";
import { put } from '@vercel/blob'; // Import `put` for file uploads

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'applie') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const resumeFile = formData.get('resume');
  const jdId = formData.get('jdId');

  if (!resumeFile || !jdId) {
    return NextResponse.json({ error: 'Resume file and Job ID are required.' }, { status: 400 });
  }

  // This is the advanced prompt for the Resume Analyzer
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
    await dbConnect();
    
    // Fetch the HR user's API key based on the Job Description
    const jd = await JobDescription.findById(jdId);
    if (!jd) throw new Error("The specified job description does not exist.");

    const hrUser = await User.findById(jd.hrId).select('geminiApiKey');
    if (!hrUser || !hrUser.geminiApiKey) {
        throw new Error("The recruiter for this job has not configured their AI API key.");
    }
    const apiKey = hrUser.geminiApiKey;
    
    // --- FILE UPLOAD LOGIC ---
    // Upload the resume to Vercel Blob to get a permanent, public URL
    const blob = await put(resumeFile.name, resumeFile, {
        access: 'public',
        addRandomSuffix: true, // Guarantees a unique filename to prevent overwrites
    });
    // --- END OF FILE UPLOAD LOGIC ---

    // Process the file with Gemini for AI analysis
    const { structuredOutput } = await processFileWithUserKey(resumeFile, resumeAnalysisPrompt, apiKey);

    if (!structuredOutput || !structuredOutput.fullText) {
      throw new Error("Failed to get structured output or full text from AI.");
    }
    
    // Save the new Resume document with the REAL file URL from Vercel Blob
    const newResume = new Resume({
      applieId: session.user.id,
      fileUrl: blob.url, // Use the actual URL from the upload
      parsedText: structuredOutput.fullText,
      analysisResult: structuredOutput,
    });
    await newResume.save();

    // Log the agent interaction
    await AgentLog.create({
        userId: session.user.id,
        agentType: 'RESUME_PARSER',
        fileName: resumeFile.name,
        rawInput: `File: ${resumeFile.name}, JD: ${jdId}`,
        aiOutput: structuredOutput,
    });

    return NextResponse.json({ 
        success: true, 
        message: 'Resume analyzed successfully.',
        resumeId: newResume._id.toString(), // Send back the new resume ID as a string
        analysis: structuredOutput,
    }, { status: 200 });

  } catch (error) {
    console.error('Resume analysis failed:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}