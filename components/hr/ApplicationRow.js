// components/hr/ApplicationRow.js
"use client";

import { useState } from 'react';
import ApplicationStatusUpdater from './ApplicationStatusUpdater';
import ScheduleMeetingButton from './ScheduleMeetingButton';

// Import Material You Web Components for icons
// We avoid direct imports here to prevent build errors, relying on the global registration in layout.js.
// import '@material/web/icon/icon.js'; // for expand/collapse icon

export default function ApplicationRow({ app, hrId }) {
    const [isOpen, setIsOpen] = useState(false);

    // --- ACCESS DATA FROM THE NEW FLATTENED SCHEMA ---
    const matchScore = app.matchScore || 0;
    const feedback = app.feedbackForCandidate || 'No feedback available.';
    const matchedSkills = app.matchedSkills || [];
    const missingSkills = app.missingSkills || [];
    const resumeUrl = app.resumeId?.fileUrl;

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

                {/* Expand/Collapse Icon */}
                <div className="flex-shrink-0 md-typescale-title-large text-on-surface-variant transition-transform duration-200">
                    <md-icon>{isOpen ? 'expand_less' : 'expand_more'}</md-icon> {/* Material You Icon */}
                </div>
            </div>

            {/* Collapsible Details View */}
            {isOpen && (
                <div className="p-6 sm:p-8 border-t border-outline-variant bg-surface-container-lowest">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Left Side: AI Analysis */}
                        <div>
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
                                    <Link
                                        href={resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        passHref
                                    >
                                        <md-text-button className="mt-2 text-primary"> {/* Material You Text Button */}
                                            Download Full Resume
                                        </md-text-button>
                                    </Link>
                                ) : (
                                    <p className="md-typescale-body-medium text-on-surface-variant italic mt-2">
                                        Resume file not available.
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Right Side: Cover Letter & Actions */}
                        <div>
                            <h4 className="md-typescale-title-large text-on-surface mb-3">Generated Cover Letter</h4>
                            <div className="md-typescale-body-medium p-4 bg-surface-container-high rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap border border-outline-variant text-on-surface-variant">
                                {app.generatedCoverLetter || 'Not generated.'}
                            </div>
                            <div className="mt-6">
                                <h4 className="md-typescale-title-large text-on-surface mb-3">Manage Application</h4>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3"> {/* Responsive gap for buttons */}
                                    <ApplicationStatusUpdater applicationId={app.id} currentStatus={app.status} />
                                    {app.status === 'shortlisted' && (
                                        <ScheduleMeetingButton applicationId={app.id} hrId={hrId} />
                                    )}
                                    {app.status === 'interview-scheduled' && (
                                        <span className="md-typescale-label-medium text-on-surface-variant italic px-3 py-1 rounded-full bg-surface-container-low">
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