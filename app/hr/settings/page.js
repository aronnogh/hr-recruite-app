// app/hr/settings/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
// --- THIS IS THE LINE TO VERIFY ---
// This assumes your file is located at: components/hr/HrSettingsForm.js
// import HrSettingsForm from "@/components/hr/HrSettingsForm";
import HrSettingsForm from "@/components/hr/hrSettingsForm";

// This async function fetches the data on the server
async function getUserSettings(userId) {
    await dbConnect();

    const user = await User.findById(userId)
        .select('companyName geminiApiKey geminiModel schedulingLink')
        .lean(); 
    
    return user;
}

// This is the main page component, which is a Server Component
export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    // Protect the route
    if (!session || session.user.role !== 'hr') {
        redirect('/api/auth/signin?callbackUrl=/hr/settings');
    }

    // Fetch the settings on the server
    const settings = await getUserSettings(session.user.id);
    
    // Pass the clean, serializable object to the client component
    return <HrSettingsForm userSettings={JSON.parse(JSON.stringify(settings))} />;
}