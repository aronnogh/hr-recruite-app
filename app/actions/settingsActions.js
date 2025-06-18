// app/actions/settingsActions.js
"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function updateHrSettings(previousState, formData) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hr') {
        return { error: 'Unauthorized' };
    }

    // 1. Get all values from the form data.
    const geminiApiKey = formData.get('geminiApiKey');
    const schedulingLink = formData.get('schedulingLink');
    const companyName = formData.get('companyName');
    const geminiModel = formData.get('geminiModel');

    // 2. Perform validation.
    if (!schedulingLink || !schedulingLink.startsWith('https://')) {
        return { error: 'Please provide a valid scheduling link (e.g., from Calendly).' };
    }
    if (!companyName) {
        return { error: 'Company Name is required.' };
    }
    if (!geminiModel) {
        return { error: 'AI Model selection is required.'}
    }

    try {
        await dbConnect();

        // 3. Fetch the user document from the database.
        const userToUpdate = await User.findById(session.user.id);
        if (!userToUpdate) {
            return { error: 'User not found.' };
        }

        // --- THIS IS THE CRITICAL FIX ---
        // 4. Update the document fields safely.
        // This logic ensures that if a user submits an empty string for the API key,
        // it doesn't overwrite a previously saved key. They must explicitly clear it.
        // For other fields, we update them directly.
        userToUpdate.companyName = companyName;
        userToUpdate.schedulingLink = schedulingLink;
        userToUpdate.geminiModel = geminiModel;
        
        // Only update the API key if a new, non-empty value was provided.
        if (geminiApiKey) {
            userToUpdate.geminiApiKey = geminiApiKey;
        }

        // 5. Save the updated document.
        await userToUpdate.save();
        // --- END OF FIX ---

        revalidatePath('/hr/settings');
        return { success: true, message: 'Settings updated successfully!' };
    } catch (e) {
        console.error("Settings update error:", e);
        if (e.name === 'ValidationError') {
            return { error: 'Invalid data provided. Please check your inputs.' };
        }
        return { error: 'Failed to update settings due to a server error.' };
    }
}