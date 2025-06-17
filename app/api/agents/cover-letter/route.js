// app/api/agents/cover-letter/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// --- FIX 1: Import the correctly named function ---
import { generateTextWithUserKey } from '@/utils/gemini';
import dbConnect from '@/lib/mongoose';
import Application from '@/models/Application';
import AgentLog from '@/models/AgentLog';
import User from '@/models/User'; // <-- Import User model

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { applicationId, tone = 'professional' } = await req.json();
    if (!applicationId) return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });

    try {
        await dbConnect();
        
        // Fetch the application and populate related documents to get all necessary data
        const application = await Application.findById(applicationId)
            .populate({
                path: 'jdId',
                select: 'title descriptionText hrId' // We need the hrId from the JD
            })
            .populate({
                path: 'resumeId',
                select: 'parsedText' // We need the resume text
            });

        if (!application || !application.resumeId || !application.jdId) {
            return NextResponse.json({ error: 'Application data not found' }, { status: 404 });
        }
        
        // --- FIX 2: Fetch the HR user's API key ---
        const hrUser = await User.findById(application.jdId.hrId).select('geminiApiKey');
        if (!hrUser || !hrUser.geminiApiKey) {
            throw new Error("The recruiter for this job has not configured their AI API key.");
        }
        const apiKey = hrUser.geminiApiKey;
        // --- END OF FIX ---

        const prompt = `
            Act as a career coach. Based on the user's Resume and the Job Description provided, write a compelling and concise cover letter.
            The tone of the letter should be: ${tone}.
            The output should be the raw text of the cover letter only, with no extra text or formatting.

            --- RESUME TEXT ---
            ${application.resumeId.parsedText}

            --- JOB DESCRIPTION ---
            ${application.jdId.descriptionText}
        `;

        // --- FIX 3: Call the correct function with the API key ---
        const { textResponse } = await generateTextWithUserKey(prompt, apiKey);
        if (!textResponse) throw new Error("Failed to generate cover letter from AI.");

        // Update the application with the generated cover letter
        application.generatedCoverLetter = textResponse;
        await application.save();

        await AgentLog.create({
            userId: session.user.id,
            agentType: 'COVER_LETTER_GENERATOR',
            rawInput: `ApplicationID: ${applicationId}, Tone: ${tone}`,
            aiOutput: { coverLetter: textResponse }
        });

        return NextResponse.json({ success: true, coverLetter: textResponse });

    } catch (error) {
        console.error("Cover Letter Agent Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}