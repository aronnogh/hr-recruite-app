// app/api/agents/cover-letter/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateTextResponse } from '@/utils/gemini';
import dbConnect from '@/lib/mongoose';
import Application from '@/models/Application';
import AgentLog from '@/models/AgentLog';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { applicationId, tone = 'professional' } = await req.json();
    if (!applicationId) return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });

    try {
        await dbConnect();
        // Fetch the application and populate related documents
        const application = await Application.findById(applicationId).populate('resumeId').populate('jdId');
        if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        
        const resume = application.resumeId;
        const jd = application.jdId;

        const prompt = `
            Act as a career coach. Based on the user's Resume and the Job Description provided, write a compelling and concise cover letter.
            The tone of the letter should be: ${tone}.
            The output should be the raw text of the cover letter only, with no extra text or formatting.

            --- RESUME TEXT ---
            ${resume.parsedText}

            --- JOB DESCRIPTION ---
            ${jd.descriptionText}
        `;

        const { textResponse } = await generateTextResponse(prompt);
        if (!textResponse) throw new Error("Failed to generate cover letter from AI.");

        // Update the application with the generated cover letter
        application.generatedCoverLetter = textResponse;
        await application.save();

        await AgentLog.create({
            userId: session.user.id, agentType: 'COVER_LETTER_GENERATOR',
            rawInput: `ApplicationID: ${applicationId}, Tone: ${tone}`, aiOutput: { coverLetter: textResponse }
        });

        return NextResponse.json({ success: true, coverLetter: textResponse });

    } catch (error) {
        console.error("Cover Letter Agent Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}