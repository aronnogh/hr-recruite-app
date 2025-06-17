// app/api/agents/matcher/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateTextResponse } from '@/utils/gemini';
import dbConnect from '@/lib/mongoose';

// --- IMPORT THE MODELS DIRECTLY ---
import Resume from '@/models/Resume';
import JobDescription from '@/models/JobDescription';
import Application from '@/models/Application';
import AgentLog from '@/models/AgentLog';
import User from '@/models/User'; // <-- THIS IS THE CRITICAL FIX

import { sendEmail } from '@/utils/email';
import { NextStepsEmail } from '@/components/emails/NextStepsEmail';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { resumeId, jdId } = await req.json();
    if (!resumeId || !jdId) return NextResponse.json({ error: 'Resume ID and JD ID are required' }, { status: 400 });

    try {
        await dbConnect();

        // Now that the models are imported, we can use them directly.
        const [resume, jd, user] = await Promise.all([
            Resume.findById(resumeId),
            JobDescription.findById(jdId),
            User.findById(session.user.id) // <-- USE THE IMPORTED MODEL
        ]);

        if (!resume || !jd || !user) {
            return NextResponse.json({ error: 'Required data not found' }, { status: 404 });
        }
        
        const prompt = `
            Analyze the provided Resume Text and Job Description.
            Return ONLY a single JSON object with the following structure:
            {
                "matchScore": <A percentage number from 0 to 100 representing how well the resume matches the job requirements>,
                "matchedSkills": <An array of strings listing key skills present in both the resume and the job description>,
                "missingSkills": <An array of strings listing key skills required by the job but missing from the resume>,
                "feedback": "<A short paragraph providing constructive feedback to the candidate on how to better tailor their resume for this specific role.>"
            }

            --- RESUME TEXT ---
            ${resume.parsedText}

            --- JOB DESCRIPTION ---
            ${jd.descriptionText}
        `;
        
        const { structuredOutput } = await generateTextResponse(prompt);
        if (!structuredOutput) throw new Error("Failed to get structured matching results from AI.");

        const matchScore = structuredOutput.matchScore || 0;

        const newApplication = new Application({
            jdId,
            resumeId,
            applieId: session.user.id,
            matchScore: matchScore,
            matchedSkills: structuredOutput.matchedSkills,
            // Set initial status based on score
            status: matchScore >= 80 ? 'shortlisted' : 'in-review', 
        });
        
        // Save first to get an ID for the Cover Letter agent
        await newApplication.save();

        // --- EMAIL LOGIC ---
        if (matchScore >= 80) {
            await sendEmail({
                to: user.email,
                subject: `Positive Update on Your Application for ${jd.title}`,
                reactElement: <NextStepsEmail candidateName={user.name} jobTitle={jd.title} />
            });
        }
        
        await AgentLog.create({
            userId: session.user.id,
            agentType: 'SKILL_MATCHER',
            rawInput: `ResumeID: ${resumeId}, JDID: ${jdId}`,
            aiOutput: structuredOutput
        });

        return NextResponse.json({ 
            success: true, 
            applicationId: newApplication._id, 
            matchResult: structuredOutput 
        });

    } catch (error) {
        console.error("Matcher Agent Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}