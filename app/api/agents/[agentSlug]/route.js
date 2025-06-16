import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { runGemini, fileToGenerativePart } from '@/lib/gemini';
import * as prompts from '@/prompts'; // Import all prompts

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { agentSlug } = params;
  const formData = await request.formData();
  const file = formData.get('file');
  const file2 = formData.get('file2'); // For agents needing two files (e.g., JD Matcher)
  const customPrompt = formData.get('prompt'); // For custom query agent
  const jdText = formData.get('jdText'); // For JD Matcher/Cover Letter
  
  if (!file && agentSlug !== 'coverLetterGenerator' && agentSlug !== 'jdMatcher') {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  const getPromptFunction = prompts[`get${agentSlug.charAt(0).toUpperCase() + agentSlug.slice(1)}Prompt`];

  if (!getPromptFunction) {
    return NextResponse.json({ error: 'Invalid agent type' }, { status: 400 });
  }

  // Construct file parts for Gemini
  const fileParts = [];
  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    fileParts.push(fileToGenerativePart(buffer, file.type));
  }
   if (file2) {
    const buffer = Buffer.from(await file2.arrayBuffer());
    fileParts.push(fileToGenerativePart(buffer, file2.type));
  }

  // Generate the final prompt text
  let promptText = getPromptFunction({ customPrompt, jdText });

  try {
    const aiResponse = await runGemini(promptText, fileParts);
    
    // Try to parse as JSON, otherwise return as text
    try {
        const jsonResponse = JSON.parse(aiResponse);
        return NextResponse.json(jsonResponse);
    } catch (e) {
        return NextResponse.json({ text: aiResponse });
    }
  } catch (error) {
    console.error(`Error with Gemini API for agent ${agentSlug}:`, error);
    return NextResponse.json({ error: 'Failed to get response from AI model' }, { status: 500 });
  }
}