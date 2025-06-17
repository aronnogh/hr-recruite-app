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

    return (
        <div>
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="mt-2 text-gray-400">Here's a summary of the jobs you've applied for.</p>
            <div className="mt-8 space-y-4">
                {myApplications.length > 0 ? myApplications.map(app => (
                    <div key={app.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">{app.jdId.title}</h2>
                            <p className="text-sm text-gray-400">Submitted on: {new Date(app.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-lg">Match: {app.matchScore}%</p>
                             <p className="text-sm capitalize">Status: <span className="font-semibold">{app.status}</span></p>
                        </div>
                    </div>
                )) : (
                    <p>You haven't applied to any jobs yet.</p>
                )}
            </div>
        </div>
    );
}