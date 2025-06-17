// app/hr/applications/[jdId]/page.js
import dbConnect from '@/lib/mongoose';
import Application from '@/models/Application';
import JobDescription from '@/models/JobDescription';
import ApplicationStatusUpdater from '@/components/hr/ApplicationStatusUpdater';

async function getApplicationsForJd(jdId) {
    await dbConnect();
    const jd = await JobDescription.findById(jdId);
    const applications = await Application.find({ jdId })
        .populate({ path: 'applieId', select: 'name email image' }) // Populate user details
        .populate({ path: 'resumeId', select: 'analysisResult' }) // Populate resume analysis
        .sort({ matchScore: -1 }); // Sort by highest score
    
    return {
        jobTitle: jd?.title || 'Unknown Job',
        applications: JSON.parse(JSON.stringify(applications))
    };
}

export default async function ApplicationsViewPage({ params }) {
    const { jobTitle, applications } = await getApplicationsForJd(params.jdId);

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
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Applicant</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Match Score</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 bg-gray-900">
                                    {applications.map((app) => (
                                        <tr key={app.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{app.applieId.name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                <span className={`font-bold ${app.matchScore >= 80 ? 'text-green-400' : app.matchScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{app.matchScore}%</span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 capitalize">{app.status}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                <ApplicationStatusUpdater applicationId={app.id} currentStatus={app.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}