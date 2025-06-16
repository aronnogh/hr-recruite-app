// app/dashboard/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/dashboard");
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2">Welcome, {session.user.name}!</p>
            <p>Your role is: <span className="font-semibold capitalize">{session.user.role}</span></p>
            
            <div className="mt-8">
                <h2 className="text-xl font-semibold">Update Your Role</h2>
                <p className="text-gray-400 mt-1">
                    (This is a placeholder. You would build a form here to update the user's role in the MongoDB database.)
                </p>
            </div>
        </div>
    )
}