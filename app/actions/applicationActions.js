// app/actions/applicationActions.js
"use server"

import dbConnect from "@/lib/mongoose"
import Application from "@/models/Application"
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/utils/email"; // <-- Import
import { MeetingInvitationEmail } from "@/components/emails/MeetingInvitationEmail"; // <-- Import

export async function updateApplicationStatus(applicationId, status) {
    // ... (this function remains the same)
}

// --- NEW SERVER ACTION ---
export async function sendMeetingInvitation(applicationId, hrName) {
    try {
        await dbConnect();
        const application = await Application.findById(applicationId)
            .populate('applieId')
            .populate('jdId');

        if (!application || !application.applieId || !application.jdId) {
            throw new Error("Application data not found.");
        }

        // Send the email
        await sendEmail({
            to: application.applieId.email,
            subject: `Interview Invitation for the ${application.jdId.title} position`,
            reactElement: <MeetingInvitationEmail 
                candidateName={application.applieId.name} 
                jobTitle={application.jdId.title}
                hrName={hrName}
                companyName="Your App Name" // Replace with your company name
            />
        });

        // Update status to prevent sending multiple invites
        application.status = 'interview-scheduled';
        await application.save();
        
        revalidatePath(`/hr/applications/${application.jdId._id}`);
        return { success: true, message: 'Invitation sent successfully!' };

    } catch (error) {
        console.error("Failed to send meeting invitation:", error);
        return { error: error.message || 'Database or email error.' };
    }
}