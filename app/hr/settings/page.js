// app/hr/settings/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import HrSettingsForm from "@/components/hr/hrSettingsForm"; // <-- Import the new client component

// This async function fetches the data on the server
async function getUserSettings(userId) {
    await dbConnect();
    // Fetch only the fields needed to avoid leaking sensitive data
    const user = await User.findById(userId).select('geminiApiKey schedulingLink').lean();
    return user;
}

// This is the main page component, which is a Server Component
export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    // Protect the route
    if (!session || session.user.role !== 'hr') {
        redirect('/api/auth/signin');
    }

    // Fetch the settings on the server
    const settings = await getUserSettings(session.user.id);
    
    // Render the Client Component and pass the fetched data as a prop
    return <HrSettingsForm userSettings={JSON.parse(JSON.stringify(settings))} />;
}