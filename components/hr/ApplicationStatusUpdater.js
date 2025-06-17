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
        const baseClass = "md-typescale-label-large rounded-full px-5 py-2 font-medium transition-all duration-200 ease-in-out"; // Added consistent padding, font-weight, and transition for smoother effects

        // Determine if the current button's status matches the application's actual status
        if (status === currentStatus) {
            // Apply distinct Material You themed colors for the active/selected status
            switch (status) {
                case 'shortlisted':
                    // Use tertiary color for 'shortlisted' (green-like) with elevation
                    return `${baseClass} bg-tertiary text-on-tertiary shadow-md md-elevation-2`;
                case 'rejected':
                    // Use error color for 'rejected' (red-like) with elevation
                    return `${baseClass} bg-error text-on-error shadow-md md-elevation-2`;
                case 'viewed':
                    // Use primary color for 'viewed' (yellow/orange-like) with elevation
                    return `${baseClass} bg-primary text-on-primary shadow-md md-elevation-2`;
                default:
                    // Fallback for any other active status, using primary
                    return `${baseClass} bg-primary text-on-primary shadow-md md-elevation-2`;
            }
        } else {
            // For inactive statuses, use a filled-tonal appearance (Material You default for md-filled-tonal-button),
            // and apply subtle hover effects.
            return `${baseClass} bg-surface-container-high text-on-surface-variant shadow-sm hover:bg-surface-container-highest hover:shadow-md md-elevation-0`;
        }
    };

    return (
        // Container for the buttons, using Material You spacing and responsive flex behavior
        <div className="flex flex-wrap items-center gap-3 sm:gap-4"> {/* Increased gap for better spacing between buttons */}
            {/* Shortlist Button */}
            <md-filled-tonal-button
                onClick={() => handleUpdate('shortlisted')}
                disabled={isPending || currentStatus === 'shortlisted'} // Disable if already shortlisted or pending
                class={getButtonClass('shortlisted')} // Apply dynamic classes
            >
                Shortlist
            </md-filled-tonal-button>

            {/* Reject Button */}
            <md-filled-tonal-button
                onClick={() => handleUpdate('rejected')}
                disabled={isPending || currentStatus === 'rejected'} // Disable if already rejected or pending
                class={getButtonClass('rejected')} // Apply dynamic classes
            >
                Reject
            </md-filled-tonal-button>

            {/* Mark as Viewed Button */}
            <md-filled-tonal-button
                onClick={() => handleUpdate('viewed')}
                disabled={isPending || currentStatus === 'viewed'} // Disable if already viewed or pending
                class={getButtonClass('viewed')} // Apply dynamic classes
            >
                Mark as Viewed
            </md-filled-tonal-button>
        </div>
    );
}