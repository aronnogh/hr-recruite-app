// app/hr/applications/[jdId]/page.js
import dbConnect from '@/lib/mongoose';
import Application from '@/models/Application';
import JobDescription from '@/models/JobDescription';
import ApplicationStatusUpdater from '@/components/hr/ApplicationStatusUpdater';
import ScheduleMeetingButton from '@/components/hr/ScheduleMeetingButton';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';

// Explicitly import all models that will be populated
import User from '@/models/User';
import Resume from '@/models/Resume';

// The separate helper function is removed.

export default async function ApplicationsViewPage({ params }) {
    const { jdId } = params; // Destructuring is still good practice.
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hr') {
        return notFound();
    }
    
    // --- DATA FETCHING LOGIC MOVED DIRECTLY INTO THE COMPONENT ---
    await dbConnect();
    
    // 1. Fetch the Job Description and verify ownership for security.
    const jd = await JobDescription.findOne({ _id: jdId, hrId: session.user.id });

    // If the job doesn't exist or doesn't belong to this HR user, render a 404 page.
    if (!jd) {
        return notFound();
    }

    // 2. Fetch the applications for this job.
    const applications = await Application.find({ jdId })
        .populate({ path: 'applieId', model: User, select: 'name email image' })
        .populate({ path: 'resumeId', model: Resume, select: 'analysisResult' })
        .sort({ matchScore: 1 }); // Sort by matchScore in ascending order
    
    const jobTitle = jd.title;
    // --- END OF DATA FETCHING LOGIC ---


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-white">Applications for: <span className="text-blue-400">{jobTitle}</span></h1>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-white/10 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Applicant Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Match Score</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 bg-gray-900">
                                    {/* Use the fetched applications array directly */}
                                    {applications.length > 0 ? applications.map((app) => (
                                        <tr key={app._id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                                                {app.applieId?.name || 'N/A'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                <span className={`font-bold text-lg ${app.matchScore >= 80 ? 'text-green-400' : app.matchScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{app.matchScore}%</span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 capitalize">{app.status.replace('-', ' ')}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <ApplicationStatusUpdater applicationId={app._id.toString()} currentStatus={app.status} />
                                                    {app.status === 'shortlisted' && (
                                                        <ScheduleMeetingButton applicationId={app._id.toString()} hrId={session.user.id} />
                                                    )}
                                                    {app.status === 'interview-scheduled' && (
                                                        <span className="text-xs text-gray-400 italic">Invite Sent</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-400">No applications received yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}