// components/hr/ApplicationStatusUpdater.js
"use client"

import { useTransition } from "react";
import { updateApplicationStatus } from "@/app/actions/applicationActions";

// Important: We do NOT directly import Material You Web Components here like:
// import '@material/web/button/filled-tonal-button.js';
// This is because they are loaded globally in app/layout.js via the importmap and @material/web/all.js,
// which prevents build errors in Next.js Server Components and ensures client-side availability.

export default function ApplicationStatusUpdater({ applicationId, currentStatus }) {
    let [isPending, startTransition] = useTransition();

    const handleUpdate = (status) => {
        startTransition(async () => {
            await updateApplicationStatus(applicationId, status);
        });
    };

    // Helper function to dynamically apply Material You themed classes based on button status
    const getButtonClass = (status) => {
        // Base Material You typography class for all buttons
        const baseClass = "md-typescale-label-large";

        // Determine if the current button's status matches the application's actual status
        if (status === currentStatus) {
            // Apply distinct Material You themed colors for the active/selected status
            switch (status) {
                case 'shortlisted':
                    // Use tertiary color for 'shortlisted' (often a green/success-like tone in M3)
                    return `${baseClass} bg-tertiary text-on-tertiary shadow-sm`;
                case 'rejected':
                    // Use error color for 'rejected'
                    return `${baseClass} bg-error text-on-error shadow-sm`;
                case 'viewed':
                    // Use primary color for 'viewed' (as a default active state)
                    return `${baseClass} bg-primary text-on-primary shadow-sm`;
                default:
                    // Fallback to primary for any other active status
                    return `${baseClass} bg-primary text-on-primary shadow-sm`;
            }
        } else {
            // For inactive statuses, rely on the default styling of md-filled-tonal-button,
            // but ensure text color consistency and add a hover effect for interactivity.
            return `${baseClass} text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200`;
        }
    };

    return (
        // Container for the buttons, using Material You spacing and responsive flex behavior
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Shortlist Button */}
            <md-filled-tonal-button
                onClick={() => handleUpdate('shortlisted')}
                disabled={isPending}
                class={getButtonClass('shortlisted')} // Apply dynamic classes
            >
                Shortlist
            </md-filled-tonal-button>

            {/* Reject Button */}
            <md-filled-tonal-button
                onClick={() => handleUpdate('rejected')}
                disabled={isPending}
                class={getButtonClass('rejected')} // Apply dynamic classes
            >
                Reject
            </md-filled-tonal-button>

            {/* Mark as Viewed Button */}
            <md-filled-tonal-button
                onClick={() => handleUpdate('viewed')}
                disabled={isPending}
                class={getButtonClass('viewed')} // Apply dynamic classes
            >
                Mark as Viewed
            </md-filled-tonal-button>
        </div>
    );
}