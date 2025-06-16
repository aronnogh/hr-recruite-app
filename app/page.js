// app/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold text-white">Welcome to the Application</h1>

      {session ? (
        <div>
          <p className="text-lg text-green-400">You are signed in!</p>
          
          <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg max-w-md">
            <h3 className="font-semibold text-white">Session Details:</h3>
            <pre className="mt-2 text-sm text-gray-300 overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-blue-400 hover:underline font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <p className="text-lg text-red-400">Please sign in to continue.</p>
      )}
    </div>
  );
}
