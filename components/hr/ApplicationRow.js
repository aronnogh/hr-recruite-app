// components/hr/ApplicationRow.js
"use client";

import { useState, useEffect } from 'react';
import ApplicationStatusUpdater from './ApplicationStatusUpdater';
import ScheduleMeetingButton from './ScheduleMeetingButton';

export default function ApplicationRow({ app, hrId }) {
    const [isOpen, setIsOpen] = useState(false);
    // State to control rendering of client-side-only elements after hydration
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        // Set to true once the component has mounted on the client
        setHasMounted(true);
    }, []);

    // --- ORIGINAL ACCESS TO DATA (UNCHANGED) ---
    const matchScore = app.matchScore || 0;
    const feedback = app.feedbackForCandidate || 'No feedback available.';
    const matchedSkills = app.matchedSkills || [];
    const missingSkills = app.missingSkills || [];
    const resumeUrl = app.resumeId?.fileUrl;
    const generatedCoverLetter = app.generatedCoverLetter; // Reverted to original access

    // Helper to get text color based on match score
    const getMatchScoreColor = (score) => {
        if (score >= 80) return 'text-tertiary'; // Material You Tertiary for high score (often green-like)
        if (score >= 60) return 'text-primary'; // Material You Primary for medium score (often yellow-orange-like)
        return 'text-error'; // Material You Error for low score (red)
    };

    // Helper to get status chip color
    const getStatusChipColor = (status) => {
        switch (status) {
            case 'shortlisted': return 'bg-tertiary-container text-on-tertiary-container';
            case 'rejected': return 'bg-error-container text-on-error-container';
            case 'viewed': return 'bg-primary-container text-on-primary-container';
            case 'pending': return 'bg-surface-container-high text-on-surface-variant';
            case 'interview-scheduled': return 'bg-secondary-container text-on-secondary-container';
            default: return 'bg-surface-container text-on-surface-variant';
        }
    };

    return (
        // Main container for the application row, using Material You card styling
        <div className="bg-surface-container rounded-xl shadow-md border border-outline-variant overflow-hidden">
            {/* Main Row - Always Visible (Clickable area) */}
            <div
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer
                           bg-surface-container hover:bg-surface-container-high transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Applicant Info (Name & Email) */}
                <div className="flex-1 min-w-0 text-left">
                    <h3 className="md-typescale-title-large text-on-surface truncate">
                        {app.applieId?.name || 'N/A'}
                    </h3>
                    <p className="md-typescale-body-medium text-on-surface-variant truncate">
                        {app.applieId?.email}
                    </p>
                </div>

                {/* Match Score */}
                <div className="flex-shrink-0 text-center flex flex-col items-center">
                    <span className={`md-typescale-headline-small font-bold ${getMatchScoreColor(matchScore)}`}>
                        {matchScore}%
                    </span>
                    <p className="md-typescale-label-medium text-on-surface-variant">Match</p>
                </div>

                {/* Status Chip */}
                <div className={`flex-shrink-0 md-typescale-label-large font-semibold px-4 py-2 rounded-full capitalize ${getStatusChipColor(app.status)}`}>
                    {app.status.replace('-', ' ')}
                </div>

                {/* Expand/Collapse Icon - Only render <md-icon> after component has mounted on client */}
                <div className="flex-shrink-0 md-typescale-title-large text-on-surface-variant transition-transform duration-200">
                    {hasMounted ? ( // Conditionally render md-icon
                        // CORRECT usage of Material Symbols text for md-icon
                        <md-icon>{isOpen ? '▲' : '▼'}</md-icon>
                    ) : (
                        // Fallback for server render (or before client hydration) to prevent mismatch
                        <span>{isOpen ? '▲' : '▼'}</span>
                    )}
                </div>
            </div>

            {/* Collapsible Details View */}
            {isOpen && (
                <div className="p-6 sm:p-8 border-t border-outline-variant bg-surface-container-lowest">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Left Side: AI Analysis */}
                        <div className='text-justify'>
                            <h4 className="md-typescale-title-large text-on-surface mb-3">AI Analysis</h4>
                            <div className="space-y-3 md-typescale-body-medium text-on-surface-variant">
                                <p>
                                    <strong className="text-on-surface">Feedback for Candidate:</strong> {feedback}
                                </p>
                                <p>
                                    <strong className="text-on-surface">Matched Skills:</strong>{' '}
                                    <span className="text-tertiary">
                                        {matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None specified'}
                                    </span>
                                </p>
                                <p>
                                    <strong className="text-on-surface">Missing Skills:</strong>{' '}
                                    <span className="text-error">
                                        {missingSkills.length > 0 ? missingSkills.join(', ') : 'None specified'}
                                    </span>
                                </p>

                                {resumeUrl && resumeUrl !== "TBD" ? (
                                    // Use a regular 'a' tag for server rendering, replace with md-text-button on client
                                    hasMounted ? (
                                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                            <md-text-button class="mt-2 text-primary">
                                                Download Full Resume
                                            </md-text-button>
                                        </a>
                                    ) : (
                                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-primary hover:underline font-semibold">
                                            Download Full Resume
                                        </a>
                                    )
                                ) : (
                                    <p className="md-typescale-body-medium text-on-surface-variant italic mt-2">
                                        Resume file not available.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Generated Cover Letter & Application Management */}
                        <div className="flex flex-col">
    {/* Generated Cover Letter Section */}
    <div className="mb-8 p-6 bg-surface-container-low rounded-2xl shadow-lg border border-outline-variant"> {/* Added padding, more rounded, significant shadow, and specific background */}
        <h4 className="md-typescale-title-large text-on-surface mb-4">Generated Cover Letter</h4> {/* Increased margin-bottom for heading */}
        <div className="md-typescale-body-medium bg-surface-container-high rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap text-on-surface-variant p-4"> {/* Inner div for content, slightly less rounded, padding, and distinct background */}
            {generatedCoverLetter || 'Not generated.'}
        </div>
    </div>

    {/* Application Management Section */}
    <div className="flex-grow p-6 bg-surface-container-low rounded-2xl shadow-lg border border-outline-variant"> {/* Same styling as Cover Letter section for consistency */}
        <h4 className="md-typescale-title-large text-on-surface mb-5">Manage Application</h4> {/* Increased margin-bottom for heading */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4"> {/* Consistent button spacing */}
            {/* Application Status Updater - Assuming it takes styling props or has internal Material You styling */}
            {/* We will now pass explicit color preferences to ApplicationStatusUpdater if it supports it,
                or you would modify that component to use Material You buttons with these colors. */}
            <ApplicationStatusUpdater
                applicationId={app.id}
                currentStatus={app.status}
                // Example of how you might pass color intent if ApplicationStatusUpdater supports it
                // onShortlistColor="tertiary" // Green-like
                // onRejectColor="error"      // Red-like
                // onViewedColor="primary"    // Yellow-like
            />

            {app.status === 'shortlisted' && (
                // Schedule Meeting Button - Now with a primary/yellow-like Material You color
                <ScheduleMeetingButton applicationId={app.id} hrId={hrId}
                    // This component would ideally render an <md-filled-button>
                    // and apply these classes via its internal logic based on a prop.
                    // For direct Tailwind, you'd add:
                    // className="bg-primary text-on-primary md-elevation-1 rounded-full px-4 py-2 font-medium"
                />
            )}

            {app.status === 'interview-scheduled' && (
                <span className="md-typescale-label-large text-on-secondary-container px-4 py-2 rounded-full bg-secondary-container-low shadow-sm italic transition-colors duration-200">
                    Invite Sent
                </span>
            )}
        </div>
    </div>
</div>
                    </div>
                </div>
            )}
        </div>
    );
}