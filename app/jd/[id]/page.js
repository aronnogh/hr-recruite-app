// app/jd/[id]/page.js
import dbConnect from "@/lib/mongoose";
import JobDescription from "@/models/JobDescription";
import { notFound } from "next/navigation";
import Link from 'next/link';

async function getJobDescription(id) {
    try {
        await dbConnect();
        const jd = await JobDescription.findById(id);
        if (!jd) return null;
        return JSON.parse(JSON.stringify(jd));
    } catch (error) {
        // If the ID format is invalid, findById will throw an error
        console.error("Error fetching JD by ID:", error);
        return null;
    }
}

export default async function PublicJdPage({ params }) {
    const jd = await getJobDescription(params.id);

    if (!jd) {
        notFound(); // Renders the not-found.js file or a default 404 page
    }

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-blue-400 mb-4">{jd.title}</h1>
            <p className="text-sm text-gray-500 mb-6">
                Posted on {new Date(jd.createdAt).toLocaleDateString()}
            </p>
            
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                {jd.descriptionText}
            </div>

            {jd.uploadedFileUrl && (
                <div className="mt-8">
                    <Link 
                        href={jd.uploadedFileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                    >
                        Download Full JD (PDF)
                    </Link>
                </div>
            )}
        </div>
    );
}