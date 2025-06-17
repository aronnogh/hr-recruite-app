// app/hr/applications/[jdId]/page.js
import dbConnect from '@/lib/mongoose';
import Application from '@/models/Application';
import JobDescription from '@/models/JobDescription';
import ApplicationStatusUpdater from '@/components/hr/ApplicationStatusUpdater';
import ScheduleMeetingButton from '@/components/hr/ScheduleMeetingButton';
import ApplicationRow from '@/components/hr/ApplicationRow';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';

// Explicitly import all models that will be populated to prevent schema errors
import User from '@/models/User';
import Resume from '@/models/Resume';

async function getApplicationsForJd(jdId, hrId) {
    await dbConnect();
    
    // Ensure the job exists and belongs to the current HR user for security
    const jd = await JobDescription.findOne({ _id: jdId, hrId: hrId });
    if (!jd) return null;

    const applications = await Application.find({ jdId })
        .populate({ path: 'applieId', model: User, select: 'name email' })
        // We only need the fileUrl from the resume for the download link
        .populate({ path: 'resumeId', model: Resume, select: 'fileUrl' })
        // Use dot notation to sort by the nested score field.
        .sort({ 'aiAnalysis.finalScore.totalScore': -1 }); // Sort by highest score first
    
    return {
        jobTitle: jd.title,
        applications: applications // Pass the raw mongoose documents
    };
}

export default async function ApplicationsViewPage({ params }) {
    const { jdId } = params;
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hr') {
        return notFound();
    }
    
    const data = await getApplicationsForJd(jdId, session.user.id);

    if (!data) {
        return notFound();
    }

    const { jobTitle, applications } = data;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-white">Applications for: <span className="text-blue-400">{jobTitle}</span></h1>
            <p className="text-gray-400 mt-1">{applications.length} application(s) received.</p>
            
            <div className="mt-8 space-y-4">
                {applications.length > 0 ? (
                    applications.map((app) => (
                        <ApplicationRow 
                            key={app._id.toString()} 
                            // Serialize the data here when passing to the Client Component
                            app={JSON.parse(JSON.stringify(app))} 
                            hrId={session.user.id} 
                        />
                    ))
                ) : (
                    <div className="text-center py-10 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">No applications received yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}