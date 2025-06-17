// app/select-role/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateUserRole } from "../actions/updateRole";

// Import Material You Web Components for buttons and icons (assuming global availability)
// import '@material/web/button/outlined-button.js';
// import '@material/web/icon/icon.js';

function RoleSelectionCard({ role, title, description, onSelect, isUpdating }) {
    return (
        // Using md-outlined-button as a clickable card, which fits Material You's interactive elements
        <md-outlined-button
            onClick={() => onSelect(role)}
            disabled={isUpdating}
            // Tailwind classes to control size, padding, and text alignment
            class="p-6 sm:p-8 text-left w-full max-w-sm md:w-96 h-auto flex flex-col items-start justify-start cursor-pointer md-typescale-body-large"
        >
            <h3 className="md-typescale-title-large text-primary mb-2"> {/* Material You Title typography and primary color */}
                {title}
            </h3>
            <p className="md-typescale-body-medium text-on-surface-variant flex-grow"> {/* Body typography and muted color */}
                {description}
            </p>
            {/* Optional: Add an icon or indicator here */}
            <div className="mt-4 text-on-surface-variant">
                <md-icon>chevron_right</md-icon> {/* Material You icon for selection */}
            </div>
        </md-outlined-button>
    );
}

export default function SelectRolePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);

    const handleRoleSelect = async (role) => {
        setIsUpdating(true);
        setError(null);

        const result = await updateUserRole(role);

        if (result.error) {
            setError(result.error);
            setIsUpdating(false);
        } else if (result.success) {
            await update({ role: result.role });

            const targetDashboard = result.role === 'hr' ? '/hr/dashboard' : '/dashboard';
            router.push(targetDashboard);
            router.refresh();
        }
    };

    if (!session) {
        return (
            // Loading state with Material You typography and color
            <div className="flex items-center justify-center min-h-screen bg-surface">
                <p className="md-typescale-body-large text-on-surface-variant">Loading session...</p>
            </div>
        );
    }

    return (
        // Main container with Material You background and responsive spacing
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4 sm:p-6 md:p-8">
            <div className="text-center mb-8"> {/* Added bottom margin */}
                <h1 className="md-typescale-headline-large text-on-surface"> {/* Material You Headline typography */}
                    Choose Your Role
                </h1>
                <p className="mt-2 md-typescale-body-large text-on-surface-variant"> {/* Body typography and muted color */}
                    Welcome, <span className="text-primary font-medium">{session.user.name}</span>! Please select a role to continue.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 justify-center w-full max-w-4xl"> {/* Responsive gap and max-width */}
                <RoleSelectionCard
                    role="applie"
                    title="Applie"
                    description="I am a candidate looking for job opportunities and applying to positions."
                    onSelect={handleRoleSelect}
                    isUpdating={isUpdating}
                />
                <RoleSelectionCard
                    role="hr"
                    title="HR Professional"
                    description="I am part of a company, looking to post jobs and manage applications."
                    onSelect={handleRoleSelect}
                    isUpdating={isUpdating}
                />
            </div>

            {/* Status and Error Messages */}
            {isUpdating && (
                <p className="mt-8 md-typescale-label-large text-primary-container bg-primary-container px-4 py-2 rounded-lg shadow-sm">
                    Updating your role...
                </p>
            )}
            {error && (
                <p className="mt-8 md-typescale-label-large text-error-container bg-error-container px-4 py-2 rounded-lg shadow-sm">
                    Error: {error}
                </p>
            )}
        </div>
    );
}