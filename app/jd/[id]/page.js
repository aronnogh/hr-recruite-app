// app/jd/[id]/page.js
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useParams, notFound, useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import PdfViewer from '@/components/ui/PdfViewer'; // Import the PDF viewer component

export default function PublicJdPage() {
    const { data: session, status: sessionStatus } = useSession();
    const params = useParams();
    const router = useRouter();

    const [jd, setJd] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for the entire application flow
    const [isApplying, setIsApplying] = useState(false);
    const [flowStatus, setFlowStatus] = useState('');
    const [error, setError] = useState('');
    const [applicationResult, setApplicationResult] = useState(null);
    const resumeInputRef = useRef(null);
    
    // Fetch the specific Job Description data when the component mounts or ID changes
    useEffect(() => {
        async function fetchJd() {
            if (!params.id) return;
            setIsLoading(true);
            try {
                const response = await fetch(`/api/jds/${params.id}`);
                if (!response.ok) {
                    throw new Error("Job Description not found");
                }
                const data = await response.json();
                setJd(data);
            } catch (err) {
                console.error("Failed to fetch JD:", err);
                setJd(null); // Set to null on error to trigger the 'notFound' state
            } finally {
                setIsLoading(false);
            }
        }
        fetchJd();
    }, [params.id]);

    const handleApplyClick = () => {
        if (sessionStatus === 'unauthenticated') {
            // Redirect to login, ensuring they return to this page after
            signIn('google', { callbackUrl: window.location.href });
            return;
        }
        if (session?.user?.role === 'applie') {
            // Programmatically click the hidden file input to open the file dialog
            resumeInputRef.current.click();
        }
    };

    const handleResumeUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Reset UI state for a new application attempt
        setIsApplying(true);
        setError('');
        setApplicationResult(null);

        try {
            // --- STEP 1: RESUME ANALYZER ---
            setFlowStatus('Step 1/3: Analyzing your resume...');
            const resumeFormData = new FormData();
            resumeFormData.append('resume', file);
            // This is crucial for the multi-tenant backend to find the correct HR's API key.
            resumeFormData.append('jdId', jd.id);
            
            const resumeRes = await fetch('/api/agents/resume', { method: 'POST', body: resumeFormData });
            if (!resumeRes.ok) throw new Error(`Resume Error: ${(await resumeRes.json()).error}`);
            const { resumeId } = await resumeRes.json();

            // --- STEP 2: JD MATCHER ---
            setFlowStatus('Step 2/3: Matching your skills to the job...');
            const matcherRes = await fetch('/api/agents/matcher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId, jdId: jd.id }),
            });
            if (!matcherRes.ok) throw new Error(`Matcher Error: ${(await matcherRes.json()).error}`);
            const { applicationId, matchResult } = await matcherRes.json();
            
            // --- STEP 3: COVER LETTER GENERATOR ---
            setFlowStatus('Step 3/3: Generating a custom cover letter...');
            const clRes = await fetch('/api/agents/cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId, tone: 'enthusiastic' }),
            });
            if (!clRes.ok) throw new Error(`Cover Letter Error: ${(await clRes.json()).error}`);
            const { coverLetter } = await clRes.json();

            // --- FINAL STEP: DISPLAY RESULTS ---
            setFlowStatus('Application Processed Successfully!');
            setApplicationResult({ ...matchResult, generatedCoverLetter: coverLetter });

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsApplying(false);
        }
    };
    
    // Initial loading state for the page
    if (isLoading || sessionStatus === 'loading') {
        return <div className="flex justify-center items-center h-screen"><p className="text-lg">Loading...</p></div>;
    }

    // If fetching failed or no JD was found, render a 404 page
    if (!jd) {
        return notFound();
    }
    
    const sanitizedDescription = DOMPurify.sanitize(jd.descriptionText);
    const isHr = session?.user?.role === 'hr';
    const canApply = sessionStatus === 'authenticated' && session?.user?.role === 'applie';

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 border border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{jd.title}</h1>
                        <p className="text-sm text-gray-500 mb-6">Posted on {new Date(jd.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <button 
                            onClick={handleApplyClick}
                            disabled={isApplying || isHr}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {sessionStatus === 'unauthenticated' && 'Login to Apply'}
                            {isHr && 'HR Cannot Apply'}
                            {canApply && (isApplying ? 'Processing...' : 'Apply Now')}
                        </button>
                        {canApply && (
                            <input 
                                type="file" 
                                ref={resumeInputRef} 
                                onChange={handleResumeUpload}
                                className="hidden" 
                                accept=".pdf,.docx,.txt"
                            />
                        )}
                    </div>
                </div>

                {/* --- UI FEEDBACK SECTION --- */}
                {isApplying && <div className="my-4 p-4 bg-blue-900/50 rounded-lg text-center animate-pulse">{flowStatus}</div>}
                {error && <div className="my-4 p-4 bg-red-900/50 rounded-lg text-center text-red-400">Error: {error}</div>}
                
                {applicationResult && (
                    <div className="my-6 p-6 bg-green-900/50 border border-green-700 rounded-lg">
                        <h3 className="text-2xl font-bold text-green-300">Application Submitted!</h3>
                        
                        {/* THE FIX FOR DISPLAYING THE SCORE CORRECTLY */}
                        <p className="mt-2 text-gray-300">
                            Match Score: 
                            <span className="font-bold text-xl ml-2">
                                {applicationResult.finalScore?.totalScore || 'N/A'}%
                            </span>
                        </p>
                        
                        {/* Display the AI's reasoning for the score */}
                        <p className="mt-2 text-sm text-gray-400">{applicationResult.finalScore?.reasoning}</p>

                        {applicationResult.finalScore?.totalScore >= 80 && 
                            <p className="text-sm text-green-400 mt-2">
                                Great news! You seem like a strong match and have been shortlisted.
                            </p>
                        }
                        
                         <details className="mt-4">
                            <summary className="cursor-pointer text-blue-400 hover:underline">View Your Generated Cover Letter</summary>
                            <p className="mt-2 p-4 bg-gray-900 rounded whitespace-pre-wrap">{applicationResult.generatedCoverLetter}</p>
                        </details>
                        <button onClick={() => router.push('/dashboard')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Go to Your Dashboard</button>
                    </div>
                )}
                
                <hr className="my-8 border-gray-700" />
                
                {/* --- JOB DESCRIPTION CONTENT --- */}
                {/* Conditionally render the PDF viewer or the rich text */}
                {jd.uploadedFileUrl ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-white">Job Description Document</h2>
                        <PdfViewer fileUrl={jd.uploadedFileUrl} />
                    </div>
                ) : (
                    <div 
                        className="prose prose-invert max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: sanitizedDescription }} 
                    />
                )}
            </div>
        </div>
    );
}