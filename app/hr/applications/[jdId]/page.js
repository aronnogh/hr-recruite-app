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
    // Main container applying Material You background and responsive padding
    <div className="bg-surface p-4 sm:p-6 md:p-8 rounded-xl min-h-full">
      <h1 className="md-typescale-headline-medium text-on-surface mb-2 text-center sm:text-left">
        Applications for: <span className="text-primary">{jobTitle}</span> {/* Material You Primary color for job title */}
      </h1>
      <p className="md-typescale-body-large text-on-surface-variant mb-6 text-center sm:text-left">
        {applications.length} application(s) received.
      </p>

      {/* Container for the list of applications, with Material You spacing */}
      <div className="space-y-4 sm:space-y-6">
        {applications.length > 0 ? (
          applications.map((app) => (
            // ApplicationRow is assumed to be a client component and will handle its own Material You styling
            <ApplicationRow
              key={app._id.toString()}
              // Serialize the data here when passing to the Client Component
              app={JSON.parse(JSON.stringify(app))}
              hrId={session.user.id}
            />
          ))
        ) : (
          // Styled empty state message as a Material You card
          <div className="p-6 sm:p-8 bg-surface-container rounded-2xl shadow-lg text-center border border-outline-variant min-h-[150px] flex flex-col justify-center items-center">
            <p className="md-typescale-body-large text-on-surface-variant">No applications received yet for this job.</p>
          </div>
        )}
      </div>
    </div>
  );
}