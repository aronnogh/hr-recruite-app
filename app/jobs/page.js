// app/jobs/page.js
import Link from 'next/link';
import dbConnect from '@/lib/mongoose';
import JobDescription from '@/models/JobDescription';

// Important: We do NOT directly import Material You Web Components here.
// They are assumed to be loaded globally in app/layout.js via the importmap and @material/web/all.js.
// import '@material/web/button/filled-button.js'; // For the 'View & Apply' button

async function getAllJobs() {
    await dbConnect();
    // Fetch all jobs, sorting by the most recently created
    const jobs = await JobDescription.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(jobs));
}

export default async function JobsListPage() {
    const jobs = await getAllJobs();

    return (
        // Main container applying Material You background and responsive padding
        <div className="bg-surface p-4 sm:p-6 md:p-8 rounded-xl min-h-full">
            <h1 className="md-typescale-headline-large text-on-surface mb-8 sm:mb-10 text-center">
                Open Positions
            </h1>

            {jobs.length > 0 ? (
                // Grid layout with Material You spacing
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {jobs.map((job) => (
                        // Individual Job Card with Material You styling
                        <div
                            key={job.id}
                            className="bg-surface-container rounded-xl shadow-md p-6 flex flex-col justify-between border border-outline-variant transition-transform transform hover:scale-[1.01] hover:shadow-lg"
                        >
                            <div>
                                <h2 className="md-typescale-title-large text-on-surface mb-2">
                                    {job.title}
                                </h2>
                                <p className="md-typescale-body-medium text-on-surface-variant mb-4 line-clamp-3">
                                    {/* Display a snippet of the description */}
                                    {job.descriptionText.replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                                </p>
                            </div>
                            <div className="mt-6">
                                <Link href={`/jd/${job.id}`} passHref>
                                    {/* Material You Filled Button for primary action */}
                                    <md-filled-button class="w-full md-typescale-label-large">
                                        View & Apply
                                    </md-filled-button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // No Jobs message with Material You styling
                <div className="p-8 bg-surface-container-low rounded-2xl shadow-lg text-center border border-outline-variant min-h-[200px] flex flex-col justify-center items-center">
                    <p className="md-typescale-body-large text-on-surface-variant">
                        No open positions at the moment. Please check back later.
                    </p>
                </div>
            )}
        </div>
    );
}