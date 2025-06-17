// app/jd/[id]/page.js
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useParams, notFound, useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import PdfViewer from '@/components/ui/PdfViewer'; // Import the PDF viewer component

// Important: We do NOT directly import Material You Web Components here like:
// import '@material/web/button/filled-button.js';
// import '@material/web/progress/linear-progress.js';
// This is because they are loaded globally in app/layout.js via the importmap and @material/web/all.js,
// which prevents build errors in Next.js Server Components and ensures client-side availability.

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

    // Helper to get match score color for Material You
    const getMatchScoreColor = (score) => {
        if (score >= 80) return 'text-tertiary'; // Often used for success/strong positive
        if (score >= 60) return 'text-primary';  // Good, but not top-tier
        return 'text-error';                    // Needs attention/low score
    };

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
        return (
            <div className="flex justify-center items-center min-h-screen bg-surface">
                <md-linear-progress indeterminate class="w-1/2"></md-linear-progress> {/* Material You loading indicator */}
                <p className="md-typescale-body-large text-on-surface-variant ml-4">Loading...</p>
            </div>
        );
    }

    // If fetching failed or no JD was found, render a 404 page
    if (!jd) {
        return notFound();
    }

    const sanitizedDescription = DOMPurify.sanitize(jd.descriptionText);
    const isHr = session?.user?.role === 'hr';
    const canApply = sessionStatus === 'authenticated' && session?.user?.role === 'applie';

    return (
        // Main page container with Material You background and responsive padding
        <div className="bg-surface p-4 sm:p-6 md:p-8 rounded-xl min-h-full">
            <div className="bg-surface-container-high rounded-2xl shadow-lg p-6 md:p-8 border border-outline-variant">
                {/* Header Section: Title, Date, Apply Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h1 className="md-typescale-headline-large text-on-surface mb-2">{jd.title}</h1>
                        <p className="md-typescale-label-large text-on-surface-variant">
                            Posted on {new Date(jd.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        {/* Apply Button - Material You Filled Button */}
                        <md-filled-button
                            onClick={handleApplyClick}
                            disabled={isApplying || isHr}
                            class="w-full sm:w-auto md-typescale-label-large"
                        >
                            {sessionStatus === 'unauthenticated' && 'Login to Apply'}
                            {isHr && 'HR Cannot Apply'}
                            {canApply && (isApplying ? 'Processing...' : 'Apply Now')}
                        </md-filled-button>
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
                {isApplying && (
                    <div className="my-6 p-4 bg-primary-container text-on-primary-container rounded-lg text-center flex items-center justify-center gap-4">
                        <md-linear-progress indeterminate class="flex-1 max-w-sm"></md-linear-progress>
                        <p className="md-typescale-body-large">{flowStatus}</p>
                    </div>
                )}
                {error && (
                    <div className="my-6 p-4 bg-error-container text-on-error-container rounded-lg text-center md-typescale-body-large">
                        Error: {error}
                    </div>
                )}

                {/* Application Result Section */}
                {applicationResult && (
                    <div className="my-8 p-6 bg-tertiary-container border border-tertiary-container rounded-xl shadow-md">
                        <h3 className="md-typescale-headline-small text-on-tertiary-container mb-4">
                            Application Submitted!
                        </h3>

                        <p className="md-typescale-body-large text-on-tertiary-container">
                            Match Score:{' '}
                            <span className={`font-bold ml-2 ${getMatchScoreColor(applicationResult.finalScore?.totalScore || 0)}`}>
                                {applicationResult.finalScore?.totalScore || 'N/A'}%
                            </span>
                        </p>

                        <p className="mt-2 md-typescale-body-medium text-on-tertiary-container">
                            Reasoning: {applicationResult.finalScore?.reasoning || 'N/A'}
                        </p>

                        {applicationResult.finalScore?.totalScore >= 80 &&
                            <p className="md-typescale-body-medium text-tertiary mt-4">
                                Great news! You seem like a strong match and have been shortlisted.
                            </p>
                        }

                        <details className="mt-6 border-t border-outline-variant pt-4">
                            <summary className="cursor-pointer md-typescale-label-large text-primary hover:underline">
                                View Your Generated Cover Letter
                            </summary>
                            <p className="mt-4 p-4 bg-surface-container rounded-lg whitespace-pre-wrap md-typescale-body-medium text-on-surface-variant">
                                {applicationResult.generatedCoverLetter}
                            </p>
                        </details>
                        <md-filled-tonal-button
                            onClick={() => router.push('/dashboard')}
                            class="mt-6 md-typescale-label-large"
                        >
                            Go to Your Dashboard
                        </md-filled-tonal-button>
                    </div>
                )}

                <hr className="my-8 border-outline-variant" /> {/* Material You styled divider */}

                {/* --- JOB DESCRIPTION CONTENT --- */}
                {jd.uploadedFileUrl ? (
                    <div>
                        <h2 className="md-typescale-title-large text-on-surface mb-4">Job Description Document</h2>
                        <PdfViewer fileUrl={jd.uploadedFileUrl} />
                    </div>
                ) : (
                    <div
                        // Retain prose for rich text formatting, but adjust base text color
                        className="prose md-typescale-body-large text-on-surface-variant max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                    />
                )}
            </div>
        </div>
    );
}