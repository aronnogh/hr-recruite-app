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

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending} 
            className="w-full mt-6 px-4 py-3 rounded-full bg-blue-600 text-white font-bold text-lg
                       hover:bg-blue-700 transition-colors duration-200 shadow-lg
                       disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            {pending ? 'Saving...' : 'Save Settings'}
        </button>
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
        <div className="p-6 sm:p-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 max-w-2xl mx-auto my-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">HR Settings</h1>
            <form action={formAction} className="space-y-6">
                
                {/* Company Name Input */}
                <div>
                    <label htmlFor="companyName" className="block text-lg font-medium text-gray-300 mb-2">Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        id="companyName"
                        defaultValue={userSettings?.companyName || ''}
                        placeholder="Your Company LLC"
                        required
                        className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                
                {/* Google Gemini API Key Input */}
                <div>
                    <label htmlFor="geminiApiKey" className="block text-lg font-medium text-gray-300 mb-2">Google Gemini API Key</label>
                    <input
                        type="password"
                        name="geminiApiKey"
                        id="geminiApiKey"
                        defaultValue={userSettings?.geminiApiKey || ''}
                        placeholder="Enter your Gemini API Key"
                        className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="mt-2 text-sm text-gray-500">Your key is stored securely and used for all AI processing.</p>
                </div>

                {/* --- NEW MODEL SELECTION DROPDOWN --- */}
                <div>
                    <label htmlFor="geminiModel" className="block text-lg font-medium text-gray-300 mb-2">Preferred AI Model</label>
                    <select
                        id="geminiModel"
                        name="geminiModel"
                        defaultValue={userSettings?.geminiModel || 'gemini-1.5-flash-latest'}
                        className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                   transition-colors appearance-none"
                    >
                        {modelOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-500">
                        Use 1.5 Pro for best quality PDF analysis. Use 1.5 Flash for faster, cheaper text-only tasks.
                    </p>
                </div>
                {/* --- END OF NEW DROPDOWN --- */}
                
                {/* Scheduling Link Input */}
                <div>
                    <label htmlFor="schedulingLink" className="block text-lg font-medium text-gray-300 mb-2">Scheduling Link</label>
                    <input
                        type="url"
                        name="schedulingLink"
                        id="schedulingLink"
                        defaultValue={userSettings?.schedulingLink || ''}
                        placeholder="https://calendly.com/your-name"
                        required
                        className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="mt-2 text-sm text-gray-500">This link will be sent to shortlisted candidates.</p>
                </div>

                <SubmitButton />
            </form>
        </div>
    );
}