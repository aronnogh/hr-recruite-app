// components/hr/HrSettingsForm.js
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { updateHrSettings } from "@/app/actions/settingsActions";

// A list of models to display in the dropdown. This should be kept in sync with the User schema.
const modelOptions = [
    { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Best Quality & PDF Reading)' },
    { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Fast & Cost-Effective)' },
    { value: 'gemini-pro', label: 'Gemini Pro (Legacy Text Model)' },
];

// SubmitButton component now uses a Material You md-filled-button
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <md-filled-button
            type="submit"
            disabled={pending}
            class="w-full mt-6" // Tailwind classes for width and margin
            // Material You components inherit colors and typography from global CSS vars
            // If you need a specific color like #d0bcff (dark mode primary), the component will pick it up
            // automatically if it's your primary color in dark mode.
            // No explicit 'bg-...' or 'text-...' classes needed here for md-filled-button.
        >
            {pending ? 'Saving...' : 'Save Settings'}
        </md-filled-button>
    );
}

export default function HrSettingsForm({ userSettings }) {
    const [state, formAction] = useActionState(updateHrSettings, null);

    useEffect(() => {
        if (state?.success) {
            alert(state.message); // Simple success feedback
        } else if (state?.error) {
            alert(`Error: ${state.error}`); // Simple error feedback
        }
    }, [state]);

    return (
        // Main container applying Material You card styling
        <div className="p-6 sm:p-8 md:p-10 bg-surface-container rounded-2xl shadow-lg border border-outline-variant max-w-2xl mx-auto my-8">
            <h1 className="md-typescale-headline-small text-on-surface mb-6 text-center">HR Settings</h1>
            <form action={formAction} className="space-y-6"> {/* Material You spacing between form groups */}

                {/* Company Name Input */}
                <div>
                    <label htmlFor="companyName" className="block md-typescale-label-large text-on-surface-variant mb-2">Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        id="companyName"
                        defaultValue={userSettings?.companyName || ''}
                        placeholder="Your Company LLC"
                        required
                        className="w-full px-4 py-3
                                   bg-surface-container-high text-on-surface border border-outline
                                   rounded-lg shadow-sm
                                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container
                                   md-typescale-body-large
                                   transition-colors duration-200"
                    />
                </div>

                {/* Google Gemini API Key Input */}
                <div>
                    <label htmlFor="geminiApiKey" className="block md-typescale-label-large text-on-surface-variant mb-2">Google Gemini API Key</label>
                    <input
                        type="password"
                        name="geminiApiKey"
                        id="geminiApiKey"
                        defaultValue={userSettings?.geminiApiKey || ''}
                        placeholder="Enter your Gemini API Key"
                        className="w-full px-4 py-3
                                   bg-surface-container-high text-on-surface border border-outline
                                   rounded-lg shadow-sm
                                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container
                                   md-typescale-body-large
                                   transition-colors duration-200"
                    />
                    <p className="mt-2 md-typescale-body-small text-on-surface-variant">Your key is stored securely and used for all AI processing.</p>
                </div>

                {/* Preferred AI Model Dropdown */}
                <div>
                    <label htmlFor="geminiModel" className="block md-typescale-label-large text-on-surface-variant mb-2">Preferred AI Model</label>
                    <div className="relative"> {/* Added relative positioning for custom dropdown arrow */}
                        <select
                            id="geminiModel"
                            name="geminiModel"
                            defaultValue={userSettings?.geminiModel || 'gemini-1.5-flash-latest'}
                            className="w-full px-4 py-3
                                       bg-surface-container-high text-on-surface border border-outline
                                       rounded-lg shadow-sm
                                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container
                                       md-typescale-body-large
                                       transition-colors duration-200
                                       appearance-none pr-10" /* appearance-none to hide default arrow, pr-10 for custom icon space */
                        >
                            {modelOptions.map(option => (
                                <option key={option.value} value={option.value} className="bg-surface text-on-surface"> {/* Style options for dark mode readability */}
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {/* Custom dropdown arrow icon */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                        </div>
                    </div>
                    <p className="mt-2 md-typescale-body-small text-on-surface-variant">
                        Use 1.5 Pro for best quality PDF analysis. Use 1.5 Flash for faster, cheaper text-only tasks.
                    </p>
                </div>

                {/* Scheduling Link Input */}
                <div>
                    <label htmlFor="schedulingLink" className="block md-typescale-label-large text-on-surface-variant mb-2">Scheduling Link</label>
                    <input
                        type="url"
                        name="schedulingLink"
                        id="schedulingLink"
                        defaultValue={userSettings?.schedulingLink || ''}
                        placeholder="https://calendly.com/your-name"
                        required
                        className="w-full px-4 py-3
                                   bg-surface-container-high text-on-surface border border-outline
                                   rounded-lg shadow-sm
                                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container
                                   md-typescale-body-large
                                   transition-colors duration-200"
                    />
                    <p className="mt-2 md-typescale-body-small text-on-surface-variant">This link will be sent to shortlisted candidates.</p>
                </div>

                <SubmitButton />
            </form>

            {/* State messages (success/error) styled with Material You colors) */}
            {state?.error && (
                <p className="md-typescale-body-small text-error-container bg-error px-4 py-2 rounded-lg text-center mt-2">
                    {state.error}
                </p>
            )}
            {state?.success && (
                <p className="md-typescale-body-small text-on-primary-container bg-primary-container px-4 py-2 rounded-lg text-center mt-2">
                    {state.message}
                </p>
            )}
        </div>
    );
}