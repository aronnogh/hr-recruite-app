// app/actions/settingsActions.js
"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

// *** THIS IS THE FIX ***
// The action must accept `previousState` as the first argument
// when used with the `useActionState` hook.
export async function updateHrSettings(previousState, formData) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hr') {
        return { error: 'Unauthorized' };
    }

    // Now, `formData` correctly refers to the submitted form data.
    const geminiApiKey = formData.get('geminiApiKey');
    const schedulingLink = formData.get('schedulingLink');

    // Basic validation
    if (!schedulingLink || !schedulingLink.startsWith('https://')) {
        return { error: 'Please provide a valid scheduling link (e.g., from Calendly).' };
    }
    // Note: It's okay if the API key is submitted as an empty string.
    // The check for its existence should happen right before it's used by an agent.

    try {
        await dbConnect();
        await User.findByIdAndUpdate(session.user.id, {
            // Use || to avoid overwriting an existing key with an empty string
            // if the user clears the password field but doesn't intend to remove the key.
            // A better UI might have a separate "clear key" button.
            geminiApiKey: geminiApiKey || undefined, 
            schedulingLink,
        });

        revalidatePath('/hr/settings');
        return { success: true, message: 'Settings updated successfully!' };
    } catch (e) {
        console.error("Settings update error:", e);
        return { error: 'Failed to update settings.' };
    }
}