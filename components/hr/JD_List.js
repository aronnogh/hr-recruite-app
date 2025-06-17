// components/hr/JD_List.js
import Link from 'next/link';

/**
 * A server component that displays a list of job descriptions created by the HR user.
 * Each item in the list provides links to view the public JD and the internal applications page.
 * @param {object} props
 * @param {Array} props.jobDescriptions - An array of job description objects.
 */
export default function JD_List({ jobDescriptions }) {
  // Handle the case where no job descriptions have been created yet.
  if (!jobDescriptions || jobDescriptions.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-800 rounded-lg text-center border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Your Job Descriptions</h2>
        <p className="text-gray-400">You haven't created any job descriptions yet.</p>
        <p className="text-sm text-gray-500 mt-2">Use the form to create your first one.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Job Descriptions</h2>
      <div className="space-y-4">
        {jobDescriptions.map((jd) => (
          <div 
            key={jd.id} 
            className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex justify-between items-center flex-wrap gap-4"
          >
            {/* Left side: Job Title and Creation Date */}
            <div>
              <h3 className="text-xl font-semibold text-white">{jd.title}</h3>
              <p className="text-sm text-gray-400">
                Created on: {new Date(jd.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Right side: Action Links */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* NEW: Link to the page showing all applications for this JD */}
              <Link 
                href={`/hr/applications/${jd.id}`} 
                className="font-semibold text-green-400 hover:text-green-300 hover:underline transition-colors"
              >
                View Applications
              </Link>

              {/* Link to the public-facing job description page */}
              <Link 
                href={jd.publicUrl} 
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Public Link
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}