export const getResumeAnalyzerPrompt = () => {
  return `
    Analyze the provided resume (CV).
    Provide the output in a structured JSON format with the following keys: "strengths", "weaknesses", "coreSkills", "suggestedCareerTracks".
    - "strengths": An array of strings highlighting the key positive aspects.
    - "weaknesses": An array of strings pointing out areas for improvement.
    - "coreSkills": An array of strings listing the most prominent technical and soft skills.
    - "suggestedCareerTracks": An array of strings with potential job roles or career paths based on the resume.
    
    Do not include any introductory text or markdown formatting. The output must be only the JSON object.
  `;
};