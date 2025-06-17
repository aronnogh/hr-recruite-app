// app/jobs/page.js
import Link from 'next/link';
import dbConnect from '@/lib/mongoose';
import JobDescription from '@/models/JobDescription';

async function getAllJobs() {
    await dbConnect();
    // Fetch all jobs, sorting by the most recently created
    const jobs = await JobDescription.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(jobs));
}

export default async function JobsListPage() {
    const jobs = await getAllJobs();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-center text-blue-400 mb-10">Open Positions</h1>
            
            {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-between border border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{job.title}</h2>
                                <p className="text-gray-400 mb-4 line-clamp-3">
                                    {/* Display a snippet of the description */}
                                    {job.descriptionText.replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                                </p>
                            </div>
                            <div className="mt-6">
                                <Link
                                    href={`/jd/${job.id}`}
                                    className="w-full text-center inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    View & Apply
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 text-lg">No open positions at the moment. Please check back later.</p>
            )}
        </div>
    );
}