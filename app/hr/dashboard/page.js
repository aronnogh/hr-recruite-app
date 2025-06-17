// app/hr/dashboard/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongoose';
import JobDescription from '@/models/JobDescription';
import JD_UploadForm from "@/components/hr/JD_UploadForm";
import JD_List from "@/components/hr/JD_List";

async function getJobDescriptions(hrId) {
  await dbConnect();
  // Fetch JDs and sort by most recent
  const jds = await JobDescription.find({ hrId }).sort({ createdAt: -1 });
  // Mongoose documents are not plain objects, so we need to serialize them
  return JSON.parse(JSON.stringify(jds));
}

export default async function HRDashboardPage() {
  const session = await getServerSession(authOptions);
  const jobDescriptions = await getJobDescriptions(session.user.id);

  return (
    // Main container for the dashboard page, applying Material You background and responsive padding
    <div className="bg-surface p-4 sm:p-6 md:p-8 rounded-xl min-h-full">
      <h1 className="md-typescale-headline-medium text-on-surface mb-6 sm:mb-8 md:mb-10 text-center">
        HR Dashboard
      </h1>

      {/* Grid layout for JD_UploadForm and JD_List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"> {/* Adjusted gap for Material You spacing */}
        {/* JD Upload Form (spanning 1 column on large screens, full width on small/medium) */}
        <div className="lg:col-span-1">
          {/* JD_UploadForm itself is expected to be styled with Material You within its component file */}
          <JD_UploadForm />
        </div>

        {/* Job Description List (spanning 2 columns on large screens, full width on small/medium) */}
        <div className="lg:col-span-2">
          {/* JD_List itself is expected to be styled with Material You within its component file */}
          <JD_List jobDescriptions={jobDescriptions} />
        </div>
      </div>
    </div>
  );
}