// app/api/agents/matcher/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateTextWithUserKey } from '@/utils/gemini';
import dbConnect from '@/lib/mongoose';
import Resume from '@/models/Resume';
import JobDescription from '@/models/JobDescription';
import Application from '@/models/Application';
import AgentLog from '@/models/AgentLog';
import User from '@/models/User';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId, jdId } = await req.json();
    if (!resumeId || !jdId) {
        return NextResponse.json({ error: 'Resume ID and Job Description ID are required' }, { status: 400 });
    }

    try {
        await dbConnect();
        
        const [resume, jd] = await Promise.all([
            Resume.findById(resumeId),
            JobDescription.findById(jdId)
        ]);

        if (!resume || !jd) {
            return NextResponse.json({ error: 'Resume or Job Description not found' }, { status: 404 });
        }
        
        const hrUser = await User.findById(jd.hrId).select('geminiApiKey');
        if (!hrUser || !hrUser.geminiApiKey) {
            throw new Error("The recruiter for this job has not configured their AI API key.");
        }
        const apiKey = hrUser.geminiApiKey;

        const prompt = `
            Act as a world-class Senior Technical Recruiter and Talent Analyst. Your task is to perform a detailed, step-by-step analysis comparing the provided Resume against the Job Description. Your output MUST be a single, minified JSON object with no markdown formatting. The reasoning for your final score must be built from the intermediate analysis steps.

            The JSON output must have this exact structure:
            {
              "analysisSteps": {
                "requiredSkillsAnalysis": [
                  { "skill": "<Name of a required skill>", "isPresent": <boolean>, "evidence": "<...>" }
                ]
              },
              "finalScore": {
                "totalScore": <A percentage number from 0 to 100>,
                "reasoning": "<...>"
              },
              "summaryAndFeedback": {
                "candidateFeedback": "<Constructive feedback for the applicant on how to improve their resume for this type of role.>"
              }
            }

            --- JOB DESCRIPTION ---
            ${jd.descriptionText}

            --- RESUME TEXT ---
            ${resume.parsedText}
        `;

        const { structuredOutput } = await generateTextWithUserKey(prompt, apiKey);
        if (!structuredOutput) throw new Error("Failed to get structured matching results from AI.");

        // --- EXTRACT DATA FROM AI RESPONSE ---
        const matchScore = structuredOutput.finalScore?.totalScore || 0;
        
        const matchedSkills = structuredOutput.analysisSteps?.requiredSkillsAnalysis
            ?.filter(skill => skill.isPresent)
            .map(skill => skill.skill) || [];
            
        const missingSkills = structuredOutput.analysisSteps?.requiredSkillsAnalysis
            ?.filter(skill => !skill.isPresent)
            .map(skill => skill.skill) || [];
            
        const feedbackForCandidate = structuredOutput.summaryAndFeedback?.candidateFeedback || "No feedback generated.";

        // --- SAVE THE FLATTENED DATA TO THE DATABASE ---
        const newApplication = new Application({
            jdId,
            resumeId,
            applieId: session.user.id,
            matchScore: matchScore,
            feedbackForCandidate: feedbackForCandidate,
            matchedSkills: matchedSkills,
            missingSkills: missingSkills,
            status: matchScore >= 80 ? 'shortlisted' : 'in-review',
        });
        
        await newApplication.save();
        
        await AgentLog.create({
            userId: session.user.id,
            agentType: 'SKILL_MATCHER_V2',
            rawInput: `ResumeID: ${resumeId}, JDID: ${jdId}`,
            aiOutput: structuredOutput // We still log the full object for debugging
        });

        // We return the full object to the front-end for immediate display
        return NextResponse.json({ 
            success: true, 
            applicationId: newApplication._id.toString(), 
            matchResult: structuredOutput 
        });

    } catch (error) {
        console.error("Matcher Agent Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}