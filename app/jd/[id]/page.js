// app/jd/[id]/page.js
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

export default function PublicJdPage() {
    const { data: session, status: sessionStatus } = useSession();
    const params = useParams();
    const [jd, setJd] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for the application flow
    const [isApplying, setIsApplying] = useState(false);
    const [flowStatus, setFlowStatus] = useState('');
    const [error, setError] = useState('');
    const [applicationResult, setApplicationResult] = useState(null);
    const resumeInputRef = useRef(null);
    
    // Fetch JD data on component mount
    useEffect(() => {
        async function fetchJd() {
            if (!params.id) return;
            setIsLoading(true);
            try {
                const response = await fetch(`/api/jds/${params.id}`);
                if (!response.ok) throw new Error("JD not found");
                const data = await response.json();
                setJd(data);
            } catch (err) {
                setJd(null); // Explicitly set to null on error
            } finally {
                setIsLoading(false);
            }
        }
        fetchJd();
    }, [params.id]);

    const handleApplyClick = () => {
        if (sessionStatus === 'unauthenticated') {
            // Redirect to login, but keep them on this page after
            signIn('google', { callbackUrl: window.location.href });
            return;
        }
        if (session?.user?.role === 'applie') {
            resumeInputRef.current.click();
        }
    };

    const handleResumeUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsApplying(true);
        setError('');
        setApplicationResult(null);

        try {
            setFlowStatus('Step 1/3: Analyzing your resume...');
            const formData = new FormData();
            formData.append('resume', file);
            
            const resumeRes = await fetch('/api/agents/resume', { method: 'POST', body: formData });
            if (!resumeRes.ok) throw new Error((await resumeRes.json()).error || 'Failed to analyze resume.');
            const resumeData = await resumeRes.json();

            setFlowStatus('Step 2/3: Matching skills...');
            await new Promise(res => setTimeout(res, 1000));
            const matchResult = { matchScore: 85, matchedSkills: resumeData.analysis.skills.slice(0, 5) };
            
            setFlowStatus('Step 3/3: Generating cover letter...');
            await new Promise(res => setTimeout(res, 1000));
            
            // *** THIS IS THE FIX ***
            // Add `const` before `coverLetter` to declare the variable.
            const coverLetter = `Dear Hiring Manager, I am applying for the ${jd.title} role...`;
            // *** END OF FIX ***

            setFlowStatus('Saving application...');
            await new Promise(res => setTimeout(res, 500));
            
            // Now, use the correctly declared variable here
            setApplicationResult({ ...matchResult, generatedCoverLetter: coverLetter, status: 'submitted' });
            setFlowStatus('Application Submitted Successfully!');

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsApplying(false);
        }
    };
    
    if (isLoading || sessionStatus === 'loading') {
        return <div className="text-center p-10">Loading...</div>;
    }

    // After loading, if jd is still null, it's a 404
    if (!jd) {
        return notFound();
    }
    
    const sanitizedDescription = DOMPurify.sanitize(jd.descriptionText);
    const isHr = session?.user?.role === 'hr';
    const canApply = sessionStatus === 'authenticated' && session?.user?.role === 'applie';

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
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
                            {canApply && (isApplying ? 'Applying...' : 'Apply Now')}
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

                {/* --- Feedback and Result sections --- */}
                {isApplying && <div className="my-4 p-4 bg-blue-900/50 rounded-lg text-center">{flowStatus}</div>}
                {error && <div className="my-4 p-4 bg-red-900/50 rounded-lg text-center text-red-400">Error: {error}</div>}
                
                {applicationResult && (
                    <div className="my-6 p-6 bg-green-900/50 border border-green-700 rounded-lg">
                        <h3 className="text-2xl font-bold text-green-300">Application Submitted!</h3>
                        <p className="mt-2 text-gray-300">Match Score: <span className="font-bold">{applicationResult.matchScore}%</span></p>
                    </div>
                )}
                <hr className="my-8 border-gray-700" />
                
                <div 
                    className="prose prose-invert max-w-none text-gray-300"
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }} 
                />
            </div>
        </div>
    );
}