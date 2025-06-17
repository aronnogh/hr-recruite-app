// components/hr/HrSettingsForm.js
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { updateHrSettings } from "@/app/actions/settingsActions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
        >
            {pending ? 'Saving...' : 'Save Settings'}
        </button>
    );
}

// Note the props: we will pass the existing settings from the server page.
export default function HrSettingsForm({ userSettings }) {
    const [state, formAction] = useActionState(updateHrSettings, null);
    
    useEffect(() => {
        if (state?.success) {
            alert(state.message); // Simple feedback
        } else if (state?.error) {
            alert(`Error: ${state.error}`);
        }
    }, [state]);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">HR Settings</h1>
            <form action={formAction} className="p-6 bg-gray-800 rounded-lg border border-gray-700 space-y-6">
                <div>
                    <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-300">Google Gemini API Key</label>
                    <input 
                        type="password" // Use password type to obscure the key
                        name="geminiApiKey" 
                        id="geminiApiKey" 
                        defaultValue={userSettings?.geminiApiKey || ''}
                        placeholder="Enter your Gemini API Key"
                        className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500">Your key is stored securely and used for all AI processing on your job posts.</p>
                </div>
                <div>
                    <label htmlFor="schedulingLink" className="block text-sm font-medium text-gray-300">Scheduling Link</label>
                    <input 
                        type="url" 
                        name="schedulingLink" 
                        id="schedulingLink"
                        defaultValue={userSettings?.schedulingLink || ''}
                        placeholder="e.g., https://calendly.com/your-name/30min"
                        required 
                        className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500">This link will be sent to shortlisted candidates for interview scheduling.</p>
                </div>
                <SubmitButton />
            </form>
        </div>
    );
}