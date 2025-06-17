// components/hr/JD_List.js
import Link from 'next/link';

// Import Material You Web Components for buttons (if not already handled globally by all.js)
// We avoid direct imports here to prevent build errors, relying on the global registration in layout.js.
// import '@material/web/button/text-button.js'; // For text links that act like buttons
// import '@material/web/divider/divider.js'; // For separator if needed

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
      <div className="p-6 sm:p-8 bg-surface-container rounded-2xl shadow-lg text-center border border-outline-variant min-h-[200px] flex flex-col justify-center items-center">
        <h2 className="md-typescale-headline-small text-on-surface mb-4">Your Job Descriptions</h2>
        <p className="md-typescale-body-large text-on-surface-variant">You haven't created any job descriptions yet.</p>
        <p className="md-typescale-body-medium text-on-surface-variant mt-2">Use the form on the left to create your first one.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-0"> {/* Adjust margin top for larger screens if it's the second column */}
      <h2 className="md-typescale-headline-small text-on-surface mb-6">Your Job Descriptions</h2>
      <div className="space-y-4 sm:space-y-6"> {/* Adjusted spacing for Material You feel */}
        {jobDescriptions.map((jd) => (
          <div
            key={jd.id}
            className="p-4 sm:p-6 bg-surface-container-low rounded-xl shadow-md border border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            {/* Left side: Job Title and Creation Date */}
            <div className="flex-grow text-left">
              <h3 className="md-typescale-title-large text-on-surface font-semibold mb-1">{jd.title}</h3>
              <p className="md-typescale-body-small text-on-surface-variant">
                Created on: {new Date(jd.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Right side: Action Links */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-shrink-0 w-full sm:w-auto">
              {/* Link to the page showing all applications for this JD */}
              <Link
                href={`/hr/applications/${jd.id}`}
                passHref // Important for <md-text-button> as it's not a native HTML element
              >
                <md-text-button className="w-full px-3 sm:w-auto text-primary"> {/* Material You Text Button */}
                  View Applications
                </md-text-button>
              </Link>

              {/* Link to the public-facing job description page */}
              <Link
                href={jd.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                passHref // Important for <md-text-button>
              >
                <md-text-button className="w-full px-3 sm:w-auto text-tertiary"> {/* Material You Text Button, using tertiary for a different link */}
                  Public Link
                </md-text-button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}