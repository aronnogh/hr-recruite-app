// app/api/agents/matcher/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateTextWithUserKey, extractTextFromUrl } from '@/utils/gemini'; // <-- Import new utility
import dbConnect from '@/lib/mongoose';
import Resume from '@/models/Resume';
import JobDescription from '@/models/JobDescription';
import Application from '@/models/Application';
import AgentLog from '@/models/AgentLog';
import User from '@/models/User';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { resumeId, jdId } = await req.json();
    if (!resumeId || !jdId) return NextResponse.json({ error: 'Resume ID and JD ID are required' }, { status: 400 });

    try {
        await dbConnect();
        
        const [resume, jd] = await Promise.all([
            Resume.findById(resumeId),
            JobDescription.findById(jdId)
        ]);

        if (!resume || !jd) return NextResponse.json({ error: 'Resume or Job Description not found' }, { status: 404 });
        
        const hrUser = await User.findById(jd.hrId).select('geminiApiKey');
        if (!hrUser || !hrUser.geminiApiKey) {
            throw new Error("The recruiter for this job has not configured their AI API key.");
        }
        const apiKey = hrUser.geminiApiKey;

        // --- NEW LOGIC: Get accurate JD content, whether from text or PDF ---
        let jdContent = '';
        if (jd.uploadedFileUrl) {
            console.log(`Fetching JD content from PDF URL: ${jd.uploadedFileUrl}`);
            jdContent = await extractTextFromUrl(jd.uploadedFileUrl, apiKey);
        } else {
            jdContent = jd.descriptionText;
        }

        if (!jdContent) {
            throw new Error("Could not retrieve any content for the Job Description.");
        }
        // --- END OF NEW LOGIC ---


        // --- NEW, HIGH-ACCURACY "CHAIN-OF-THOUGHT" PROMPT ---
        const prompt = `
            You are an elite Senior Technical Recruiter. Your task is to perform a rigorous, evidence-based analysis comparing a Resume against a Job Description. Your analysis must be structured and methodical.

            **Step 1: Deconstruct the Job Description.**
            Identify two distinct categories of requirements from the Job Description text:
            - "must_have_skills": These are non-negotiable requirements, often explicitly stated with words like "required", "proficient in", "strong experience with".
            - "nice_to_have_skills": These are preferred qualifications, often stated with words like "a plus", "bonus points", "familiarity with".

            **Step 2: Evidence-Based Resume Analysis.**
            For each skill identified in Step 1, scan the entire Resume text to find concrete evidence.
            - If evidence is found, quote the exact phrase from the resume.
            - If no evidence is found, you must explicitly state 'Not found.'.

            **Step 3: Scoring based on a Strict Rubric.**
            Calculate a final score from 0 to 100 based on the following weights:
            - Must-Have Skills: 70% of the total score.
            - Nice-to-Have Skills: 30% of the total score.
            - **CRITICAL RULE:** If the candidate is missing even ONE "must_have_skill", their total score cannot exceed 40%. A perfect match on all "nice_to_have_skills" cannot compensate for a missing core requirement.

            **Step 4: Synthesize and Format Output.**
            Provide your complete analysis as a single, minified JSON object with NO markdown formatting or commentary outside the object. The JSON object must follow this exact structure:

            {
              "analysis": {
                "must_have_skills": [
                  { "skill": "<Name of a must-have skill>", "isPresent": <boolean>, "evidence": "<Quote from resume or 'Not found.'>" }
                ],
                "nice_to_have_skills": [
                  { "skill": "<Name of a nice-to-have skill>", "isPresent": <boolean>, "evidence": "<Quote from resume or 'Not found.'>" }
                ]
              },
              "matchScore": {
                "score": <The calculated percentage number based on the rubric>,
                "reasoning": "<A brief, one-sentence explanation for the score, mentioning if any critical skills were missing.>"
              },
              "feedbackForCandidate": "<A short, constructive paragraph for the applicant on how their resume aligns with the role and what they could highlight better.>"
            }

            --- JOB DESCRIPTION TEXT ---
            ${jdContent}

            --- RESUME TEXT ---
            ${resume.parsedText}
        `;

        const { structuredOutput } = await generateTextWithUserKey(prompt, apiKey);
        if (!structuredOutput) throw new Error("Failed to get structured matching results from AI.");

        // --- EXTRACT AND SAVE THE NEW DATA STRUCTURE ---
        const matchScore = structuredOutput.matchScore?.score || 0;
        
        const newApplication = new Application({
            jdId,
            resumeId,
            applieId: session.user.id,
            matchScore: matchScore,
            feedbackForCandidate: structuredOutput.feedbackForCandidate,
            matchedSkills: structuredOutput.analysis?.must_have_skills?.filter(s => s.isPresent).map(s => s.skill) || [],
            missingSkills: structuredOutput.analysis?.must_have_skills?.filter(s => !s.isPresent).map(s => s.skill) || [],
            status: matchScore >= 75 ? 'shortlisted' : 'in-review', // Adjusted threshold for the stricter agent
        });
        
        await newApplication.save();
        
        await AgentLog.create({
            userId: session.user.id,
            agentType: 'SKILL_MATCHER_V3', // Version up!
            rawInput: `ResumeID: ${resumeId}, JDID: ${jdId}`,
            aiOutput: structuredOutput
        });

        // The front-end needs a consistent object, so we create one.
        const frontEndResult = {
            finalScore: {
                totalScore: matchScore,
                reasoning: structuredOutput.matchScore?.reasoning,
            },
            summaryAndFeedback: {
                candidateFeedback: structuredOutput.feedbackForCandidate,
            },
            generatedCoverLetter: "" // This will be filled by the next agent
        };

        return NextResponse.json({ 
            success: true, 
            applicationId: newApplication._id.toString(), 
            matchResult: frontEndResult // Send a consistent object to the frontend
        });

    } catch (error) {
        console.error("Matcher Agent Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}