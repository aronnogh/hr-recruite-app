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
        // Using md-filled-tonal-button for a distinct action, or md-filled-button for a primary action
        <md-filled-tonal-button
            onClick={handleSendInvite}
            disabled={isPending}
            className="md-typescale-label-large w-full sm:w-auto" // Material You typography and responsive width
        >
            {isPending ? 'Sending...' : 'Schedule Meeting'}
        </md-filled-tonal-button>
    );
}