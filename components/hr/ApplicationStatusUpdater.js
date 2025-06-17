// components/hr/ApplicationStatusUpdater.js
"use client"

import { useTransition } from "react";
import { updateApplicationStatus } from "@/app/actions/applicationActions";

export default function ApplicationStatusUpdater({ applicationId, currentStatus }) {
    let [isPending, startTransition] = useTransition();

    const handleUpdate = (status) => {
        startTransition(async () => {
            await updateApplicationStatus(applicationId, status);
        });
    };

    const getButtonClass = (status) => {
        const base = "px-3 py-1 text-sm font-semibold rounded-full disabled:opacity-50";
        if (status === currentStatus) {
            switch (status) {
                case 'shortlisted': return `${base} bg-green-500 text-white`;
                case 'rejected': return `${base} bg-red-500 text-white`;
                default: return `${base} bg-blue-500 text-white`;
            }
        }
        return `${base} bg-gray-600 hover:bg-gray-500 text-gray-200`;
    };

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => handleUpdate('shortlisted')} disabled={isPending} className={getButtonClass('shortlisted')}>Shortlist</button>
            <button onClick={() => handleUpdate('rejected')} disabled={isPending} className={getButtonClass('rejected')}>Reject</button>
            <button onClick={() => handleUpdate('viewed')} disabled={isPending} className={getButtonClass('viewed')}>Mark as Viewed</button>
        </div>
    )
}