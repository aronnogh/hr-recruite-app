// components/hr/JD_List.js
import Link from 'next/link';

export default function JD_List({ jobDescriptions }) {
  if (!jobDescriptions || jobDescriptions.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-800 rounded-lg text-center">
        <p className="text-gray-400">You haven't created any job descriptions yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Job Descriptions</h2>
      <div className="space-y-4">
        {jobDescriptions.map((jd) => (
          <div key={jd.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">{jd.title}</h3>
              <p className="text-sm text-gray-400">
                Created on: {new Date(jd.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link href={jd.publicUrl} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              View Public Link
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}