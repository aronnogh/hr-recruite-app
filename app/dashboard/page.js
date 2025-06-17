// app/dashboard/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import Application from "@/models/Application";

async function getMyApplications(userId) {
    await dbConnect();
    const applications = await Application.find({ applieId: userId })
        .populate({ path: 'jdId', select: 'title' })
        .sort({ submittedAt: -1 });
    return JSON.parse(JSON.stringify(applications));
}

export default async function ApplieDashboardPage() {
    const session = await getServerSession(authOptions);
    const myApplications = await getMyApplications(session.user.id);

    // Helper to get match score color for Material You
    const getMatchScoreColor = (score) => {
        // Assuming matchScore might be direct or nested from AI analysis
        // Using provided app.matchScore structure from your original code.
        if (score >= 80) return 'text-tertiary'; // Often used for success/strong positive
        if (score >= 60) return 'text-primary';  // Good, but not top-tier
        return 'text-error';                    // Needs attention/low score
    };

    // Helper to get status chip color for Material You
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
        // Main container applying Material You background and responsive padding
        <div className="bg-surface p-4 sm:p-6 md:p-8 rounded-xl min-h-full">
            <h1 className="md-typescale-headline-medium text-on-surface mb-6 sm:mb-8 md:mb-10 text-center sm:text-left">
                My Applications
            </h1>
            <p className="md-typescale-body-large text-on-surface-variant mb-8 text-center sm:text-left">
                Here's a summary of the jobs you've applied for.
            </p>

            <div className="space-y-4 sm:space-y-6"> {/* Material You spacing for list items */}
                {myApplications.length > 0 ? myApplications.map(app => (
                    // Individual Application Card with Material You styling
                    <div
                        key={app.id}
                        className="p-4 sm:p-6 bg-surface-container-low rounded-xl shadow-md border border-outline-variant
                                   flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                        {/* Left Side: Job Title and Submitted Date */}
                        <div className="flex-1 min-w-0 text-left">
                            <h2 className="md-typescale-title-large text-on-surface truncate mb-1">{app.jdId.title}</h2>
                            <p className="md-typescale-body-small text-on-surface-variant">
                                Submitted on: {new Date(app.submittedAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Right Side: Match Score and Status Chip */}
                        <div className="flex-shrink-0 flex flex-col items-start sm:items-end gap-2 sm:gap-0"> {/* Adjusted for responsive stacking */}
                            <p className="md-typescale-body-large text-on-surface"> {/* Material You typography */}
                                Match:{' '}
                                <span className={`md-typescale-headline-small font-bold ${getMatchScoreColor(app.matchScore)}`}>
                                    {app.matchScore}%
                                </span>
                            </p>
                            <div className={`md-typescale-label-large font-semibold px-4 py-2 rounded-full capitalize ${getStatusChipColor(app.status)}`}>
                                Status: {app.status.replace('-', ' ')}
                            </div>
                        </div>
                    </div>
                )) : (
                    // Empty State Message as a Material You card
                    <div className="p-6 sm:p-8 bg-surface-container rounded-2xl shadow-lg text-center border border-outline-variant min-h-[150px] flex flex-col justify-center items-center">
                        <p className="md-typescale-body-large text-on-surface-variant">
                            You haven't applied to any jobs yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}