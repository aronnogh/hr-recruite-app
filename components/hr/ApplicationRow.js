// components/hr/ApplicationRow.js
"use client";

import { useState } from 'react';
import ApplicationStatusUpdater from './ApplicationStatusUpdater';
import ScheduleMeetingButton from './ScheduleMeetingButton';

export default function ApplicationRow({ app, hrId }) {
    const [isOpen, setIsOpen] = useState(false);

    // --- ACCESS DATA FROM THE NEW FLATTENED SCHEMA ---
    const matchScore = app.matchScore || 0;
    const feedback = app.feedbackForCandidate || 'No feedback available.';
    const matchedSkills = app.matchedSkills || [];
    const missingSkills = app.missingSkills || [];
    const resumeUrl = app.resumeId?.fileUrl;

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
            {/* Main Row - Always Visible */}
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{app.applieId?.name || 'N/A'}</h3>
                    <p className="text-sm text-gray-400 truncate">{app.applieId?.email}</p>
                </div>
                <div className="flex-shrink-0 font-bold text-2xl text-center">
                    <span className={matchScore >= 80 ? 'text-green-400' : matchScore >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {matchScore}%
                    </span>
                    <p className="text-sm text-gray-400 ml-1">Match</p>
                </div>
                <div className="flex-shrink-0 text-sm capitalize font-semibold px-3 py-1 border rounded-full">
                    {app.status.replace('-', ' ')}
                </div>
                <div className="flex-shrink-0 text-blue-400 text-lg">
                    {isOpen ? '▲' : '▼'}
                </div>
            </div>

            {/* Collapsible Details View */}
            {isOpen && (
                <div className="p-6 border-t border-gray-700 bg-gray-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Left Side: AI Analysis */}
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-white">AI Analysis</h4>
                            <div className="space-y-3 text-sm">
                                <p><strong className="text-gray-400">Feedback for Candidate:</strong> {feedback}</p>
                                <p><strong className="text-gray-400">Matched Skills:</strong> <span className="text-green-400">{matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None specified'}</span></p>
                                <p><strong className="text-gray-400">Missing Skills:</strong> <span className="text-yellow-400">{missingSkills.length > 0 ? missingSkills.join(', ') : 'None specified'}</span></p>
                                
                                {resumeUrl && resumeUrl !== "TBD" ? (
                                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-400 hover:underline font-semibold">
                                        Download Full Resume
                                    </a>
                                ) : (
                                    <p className="text-gray-500 italic mt-2">Resume file not available.</p>
                                )}
                            </div>
                        </div>
                        {/* Right Side: Cover Letter & Actions */}
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-white">Generated Cover Letter</h4>
                            <div className="text-sm p-3 bg-gray-800 rounded max-h-48 overflow-y-auto whitespace-pre-wrap">
                                {app.generatedCoverLetter || 'Not generated.'}
                            </div>
                            <div className="mt-4">
                                <h4 className="font-bold text-lg mb-2 text-white">Manage Application</h4>
                                <div className="flex items-center gap-2">
                                    <ApplicationStatusUpdater applicationId={app.id} currentStatus={app.status} />
                                    {app.status === 'shortlisted' && (
                                        <ScheduleMeetingButton applicationId={app.id} hrId={hrId} />
                                    )}
                                    {app.status === 'interview-scheduled' && (
                                        <span className="text-xs text-gray-400 italic">Invite Sent</span>
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