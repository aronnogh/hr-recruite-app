// app/actions/applicationActions.js
"use server"

import dbConnect from "@/lib/mongoose";
import Application from "@/models/Application";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/utils/mailer";
import { MeetingInvitationEmail } from "@/components/emails/MeetingInvitationEmail";
import { render } from '@react-email/render';

// updateApplicationStatus function remains unchanged
export async function updateApplicationStatus(applicationId, status) {
    if (!['viewed', 'shortlisted', 'rejected'].includes(status)) {
        return { error: 'Invalid status' };
    }
    try {
        await dbConnect();
        const application = await Application.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        );
        if (!application) {
            return { error: 'Application not found' };
        }
        revalidatePath(`/hr/applications/${application.jdId}`);
        return { success: true };
    } catch (error) {
        console.error("Status update error:", error)
        return { error: 'Database error while updating status.' };
    }
}

export async function sendMeetingInvitation(applicationId, hrId) {
    try {
        await dbConnect();
        
        const [application, hrUser] = await Promise.all([
            Application.findById(applicationId).populate('applieId').populate('jdId'),
            User.findById(hrId).select('schedulingLink name')
        ]);

        if (!application || !hrUser) {
            throw new Error("Application or HR User data not found.");
        }
        if (!hrUser.schedulingLink) {
            throw new Error("The recruiter has not configured their scheduling link.");
        }

        const emailComponent = <MeetingInvitationEmail 
            candidateName={application.applieId.name} 
            jobTitle={application.jdId.title}
            hrName={hrUser.name}
            schedulingLink={hrUser.schedulingLink}
            companyName="Your App Name"
        />;

        // --- THIS IS THE FIX ---
        // The `render` function is async, so we must `await` its result.
        const emailHtml = await render(emailComponent);
        // --- END OF FIX ---
        
        const emailResult = await sendEmail({
            to: application.applieId.email,
            subject: `Interview Invitation: ${application.jdId.title} at Your App Name`,
            html: emailHtml,
        });
        
        if (!emailResult.success) {
            // Now, emailResult.error will be a string or a more specific object, not a Promise.
            throw new Error(emailResult.error);
        }

        application.status = 'interview-scheduled';
        await application.save();
        
        revalidatePath(`/hr/applications/${application.jdId._id}`);
        return { success: true, message: 'Invitation sent successfully!' };

    } catch (error) {
        console.error("Failed to send meeting invitation:", error);
        return { error: error.message };
    }
}