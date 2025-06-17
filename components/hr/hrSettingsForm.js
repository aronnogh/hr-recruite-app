// components/hr/HrSettingsForm.js
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { updateHrSettings } from "@/app/actions/settingsActions";

// Import Material You Web Components for input and button
// We avoid direct imports here to prevent build errors, relying on the global registration in layout.js.
// import '@material/web/button/filled-button.js';
// import '@material/web/textfield/filled-textfield.js'; // Or md-outlined-textfield

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        // Using md-filled-button for the primary action (Save Settings)
        <md-filled-button
            type="submit"
            disabled={pending}
            className="w-full md-typescale-label-large" // Material You typography and responsive width
        >
            {pending ? 'Saving...' : 'Save Settings'}
        </md-filled-button>
    );
}

// Note the props: we will pass the existing settings from the server page.
export default function HrSettingsForm({ userSettings }) {
    const [state, formAction] = useActionState(updateHrSettings, null);

    useEffect(() => {
        if (state?.success) {
            // Using browser alert for simplicity as per original, but Material You dialogs would be ideal
            alert(state.message);
        } else if (state?.error) {
            alert(`Error: ${state.error}`);
        }
    }, [state]);

    return (
        // Main container with Material You styling for the form wrapper
        <div className="p-6 sm:p-8 md:p-10 bg-surface-container rounded-2xl shadow-lg border border-outline-variant max-w-2xl mx-auto my-8">
            <h1 className="md-typescale-headline-small text-on-surface mb-6 text-center">HR Settings</h1>
            <form action={formAction} className="space-y-6"> {/* Consistent Material You spacing */}
                {/* Google Gemini API Key Input */}
                <div>
                    <label htmlFor="geminiApiKey" className="block md-typescale-label-large text-on-surface-variant mb-2">Google Gemini API Key</label>
                    <md-filled-textfield // Using Material You Filled Textfield
                        type="password"
                        name="geminiApiKey"
                        id="geminiApiKey"
                        label="Enter your Gemini API Key" // Placeholder text becomes label
                        value={userSettings?.geminiApiKey || ''} // Use 'value' for controlled or 'default-value' for uncontrolled
                        class="w-full" // Tailwind class for full width
                    ></md-filled-textfield>
                    <p className="mt-2 md-typescale-body-small text-on-surface-variant">Your key is stored securely and used for all AI processing on your job posts.</p>
                </div>

                {/* Scheduling Link Input */}
                <div>
                    <label htmlFor="schedulingLink" className="block md-typescale-label-large text-on-surface-variant mb-2">Scheduling Link</label>
                    <md-filled-textfield // Using Material You Filled Textfield
                        type="url"
                        name="schedulingLink"
                        id="schedulingLink"
                        label="e.g., https://calendly.com/your-name/30min" // Placeholder text becomes label
                        value={userSettings?.schedulingLink || ''} // Use 'value' for controlled or 'default-value' for uncontrolled
                        required
                        class="w-full" // Tailwind class for full width
                    ></md-filled-textfield>
                    <p className="mt-2 md-typescale-body-small text-on-surface-variant">This link will be sent to shortlisted candidates for interview scheduling.</p>
                </div>

                <SubmitButton />

                {/* State messages (success/error) - visually hidden here as alerts are used */}
                {/* {state?.error && (
                    <p className="md-typescale-body-small text-error-container bg-error px-4 py-2 rounded-lg text-center mt-2">
                        {state.error}
                    </p>
                )}
                {state?.success && (
                    <p className="md-typescale-body-small text-on-primary-container bg-primary-container px-4 py-2 rounded-lg text-center mt-2">
                        {state.message}
                    </p>
                )} */}
            </form>
        </div>
    );
}