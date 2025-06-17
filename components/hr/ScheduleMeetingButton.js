// components/hr/ScheduleMeetingButton.js
"use client"

import { useTransition } from "react";
import { sendMeetingInvitation } from "@/app/actions/applicationActions";

// The component now accepts hrId instead of hrName
export default function ScheduleMeetingButton({ applicationId, hrId }) {
    let [isPending, startTransition] = useTransition();

    const handleSendInvite = () => {
        if (!hrId) {
            alert("Error: HR user ID is missing.");
            return;
        }
        startTransition(async () => {
            // It now correctly passes the hrId to the server action
            const result = await sendMeetingInvitation(applicationId, hrId);
            if (result?.error) {
                alert(`Error: ${result.error}`);
            } else {
                alert(result.message);
            }
        });
    };

    return (
        <button 
            onClick={handleSendInvite} 
            disabled={isPending}
            className="px-3 py-1 text-sm font-semibold rounded-full bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
        >
            {isPending ? 'Sending...' : 'Send Invite'}
        </button>
    );
}