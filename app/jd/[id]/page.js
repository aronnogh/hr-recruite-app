// app/jd/[id]/page.js
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

export default function PublicJdPage() {
    const { data: session, status: sessionStatus } = useSession();
    const params = useParams();
    const router = useRouter();

    const [jd, setJd] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for the application flow
    const [isApplying, setIsApplying] = useState(false);
    const [flowStatus, setFlowStatus] = useState('');
    const [error, setError] = useState('');
    const [applicationResult, setApplicationResult] = useState(null);
    const resumeInputRef = useRef(null);
    
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
                setJd(null);
            } finally {
                setIsLoading(false);
            }
        }
        fetchJd();
    }, [params.id]);

    const handleApplyClick = () => {
        if (sessionStatus === 'unauthenticated') {
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
            // STEP 1: RESUME ANALYZER
            setFlowStatus('Step 1/3: Analyzing resume...');
            const resumeFormData = new FormData();
            resumeFormData.append('resume', file);
            const resumeRes = await fetch('/api/agents/resume', { method: 'POST', body: resumeFormData });
            if (!resumeRes.ok) throw new Error(`Resume Error: ${(await resumeRes.json()).error}`);
            const { resumeId } = await resumeRes.json();

            // STEP 2: JD MATCHER
            setFlowStatus('Step 2/3: Matching skills to job...');
            const matcherRes = await fetch('/api/agents/matcher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId, jdId: jd.id }),
            });
            if (!matcherRes.ok) throw new Error(`Matcher Error: ${(await matcherRes.json()).error}`);
            const { applicationId, matchResult } = await matcherRes.json();
            
            // STEP 3: COVER LETTER GENERATOR
            setFlowStatus('Step 3/3: Generating custom cover letter...');
            const clRes = await fetch('/api/agents/cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId, tone: 'enthusiastic' }),
            });
            if (!clRes.ok) throw new Error(`Cover Letter Error: ${(await clRes.json()).error}`);
            const { coverLetter } = await clRes.json();

            setFlowStatus('Application Processed Successfully!');
            setApplicationResult({ ...matchResult, generatedCoverLetter: coverLetter });

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

                {isApplying && <div className="my-4 p-4 bg-blue-900/50 rounded-lg text-center animate-pulse">{flowStatus}</div>}
                {error && <div className="my-4 p-4 bg-red-900/50 rounded-lg text-center text-red-400">Error: {error}</div>}
                
                {applicationResult && (
                    <div className="my-6 p-6 bg-green-900/50 border border-green-700 rounded-lg">
                        <h3 className="text-2xl font-bold text-green-300">Application Submitted!</h3>
                        <p className="mt-2 text-gray-300">Match Score: <span className="font-bold text-xl">{applicationResult.matchScore}%</span></p>
                        {applicationResult.matchScore >= 80 && <p className="text-sm text-green-400">Great news! You seem like a strong match. We've sent an email with the next steps.</p>}
                         <details className="mt-4">
                            <summary className="cursor-pointer text-blue-400 hover:underline">View Your Generated Cover Letter</summary>
                            <p className="mt-2 p-4 bg-gray-900 rounded whitespace-pre-wrap">{applicationResult.generatedCoverLetter}</p>
                        </details>
                        <button onClick={() => router.push('/dashboard')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Go to Your Dashboard</button>
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