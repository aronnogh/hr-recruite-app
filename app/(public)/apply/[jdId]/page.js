'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader from '@/app/components/ui/FileUploader';

export default function ApplyPage({ params }) {
  const { jdId } = params;
  const [step, setStep] = useState(1);
  const [cvFile, setCvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const router = useRouter();

  const handleCvUpload = async (file) => {
    setCvFile(file);
    setIsLoading(true);

    // This single API call will orchestrate the sequence
    const formData = new FormData();
    formData.append('cvFile', file);
    formData.append('jdId', jdId);
    
    try {
      const res = await fetch('/api/application/process', { // A new orchestrator API
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Application processing failed');

      const result = await res.json();
      setAnalysis(result.resumeAnalysis);
      setMatchResult(result.jobMatch);
      setCoverLetter(result.generatedCoverLetter.text); // Assuming .text from Gemini
      
      setStep(2); // Move to review step
    } catch (error) {
      console.error(error);
      alert('An error occurred: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    // Here you would POST the final application data to `api/application`
    // ... Logic to save Application.js model ...
    alert('Application submitted successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Apply for Job</h1>
      {isLoading && <p>Processing your application, please wait...</p>}

      {step === 1 && !isLoading && (
        <div>
          <h2 className="text-xl mb-4">Step 1: Upload Your CV</h2>
          <FileUploader onFileSelect={handleCvUpload} />
          <p className="text-sm text-gray-400 mt-2">
            We will automatically analyze your resume, match it against the job, and generate a cover letter.
          </p>
        </div>
      )}

      {step === 2 && !isLoading && (
        <div>
          <h2 className="text-xl mb-4">Step 2: Review & Submit</h2>
          <div className="space-y-6">
             {/* Display Match Score */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold">JD Match Score: {matchResult?.matchScore}%</h3>
              <p>{matchResult?.explanation}</p>
            </div>
            {/* Display Generated Cover Letter */}
            <div className="bg-gray-800 p-4 rounded-lg">
               <h3 className="font-bold">Generated Cover Letter</h3>
               <textarea 
                 value={coverLetter} 
                 onChange={(e) => setCoverLetter(e.target.value)}
                 className="w-full h-64 bg-gray-900 border border-gray-700 rounded-md p-2 mt-2"
               />
            </div>
          </div>
          <button onClick={handleSubmitApplication} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">
            Submit Full Application
          </button>
        </div>
      )}
    </div>
  );
}