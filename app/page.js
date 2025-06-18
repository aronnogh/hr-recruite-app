// app/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import Image from "next/image"; // Import Next.js Image component for optimization
// REMOVE THIS LINE: import '@material/web/button/filled-button.js'; // This import is causing the build error in a Server Component

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-6 md:p-8">
      <div className="bg-surface-container p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl max-w-xl w-full text-center border border-outline-variant">
        <h1 className="md-typescale-headline-large text-on-surface mb-4">
          Welcome to the AI Recruitment Platform
        </h1>

        {session ? (
          <div className="space-y-6">
            <p className="md-typescale-body-large text-primary">
              You are signed in!
            </p>

            {/* User Profile Card */}
            <div className="mt-4 p-4 sm:p-6 bg-surface-container-low rounded-xl border border-outline-variant max-w-sm mx-auto flex flex-col items-center gap-4">
              {session.user.image && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary-container shadow-md">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User profile picture"}
                    layout="fill" // Use fill to make image cover the div
                    objectFit="cover" // Cover the area without distortion
                    className="rounded-full"
                  />
                </div>
              )}
              <div className="text-center">
                <p className="md-typescale-title-large text-on-surface-variant font-semibold">
                  {session.user.name}
                </p>
                <p className="md-typescale-body-medium text-on-surface-variant mt-1">
                  {session.user.email}
                </p>
                {session.user.role && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">
                    Role: {session.user.role.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {/* End User Profile Card */}

            <Link href="/dashboard" passHref>
              {/* Ensure this is wrapped in a client component if interactive functionality is needed client-side,
                  but for just rendering the button, it should work if globally registered. */}
              <md-filled-button className="w-full sm:w-auto md:min-w-[200px] mt-6">
                Go to Dashboard
              </md-filled-button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="md-typescale-body-large text-error">
              Please sign in to continue.
            </p>
            {/* Optional: Add a sign-in button here if signIn function is accessible */}
            {/* <Link href="/api/auth/signin" passHref>
               <md-text-button className="mt-4">Sign In</md-text-button>
             </Link> */}
          </div>
        )}
      </div>
    </div>
  );
}