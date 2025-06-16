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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <JD_UploadForm />
            </div>
            <div className="lg:col-span-2">
                <JD_List jobDescriptions={jobDescriptions} />
            </div>
        </div>
    );
}