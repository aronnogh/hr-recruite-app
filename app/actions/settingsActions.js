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

    const geminiApiKey = formData.get('geminiApiKey');
    const schedulingLink = formData.get('schedulingLink');
    const companyName = formData.get('companyName');
    const geminiModel = formData.get('geminiModel'); // Get the new model value

    // Basic validation
    if (!schedulingLink || !schedulingLink.startsWith('https://')) {
        return { error: 'Please provide a valid scheduling link (e.g., from Calendly).' };
    }
    if (!companyName) {
        return { error: 'Company Name is required.' };
    }

    try {
        await dbConnect();

        // Find the user to get their current data
        const currentUser = await User.findById(session.user.id);
        if (!currentUser) return { error: 'User not found.' };

        // Update the document
        // If the API key field is empty in the form, don't overwrite an existing key.
        // The user must explicitly clear it if that's the intention (could be a future feature).
        currentUser.geminiApiKey = geminiApiKey || currentUser.geminiApiKey;
        currentUser.schedulingLink = schedulingLink;
        currentUser.companyName = companyName;
        currentUser.geminiModel = geminiModel; // Save the selected model

        await currentUser.save();
        
        revalidatePath('/hr/settings');
        return { success: true, message: 'Settings updated successfully!' };
    } catch (e) {
        console.error("Settings update error:", e);
        // Handle potential validation errors from the schema enum
        if (e.name === 'ValidationError') {
            return { error: 'Invalid AI model selected.' };
        }
        return { error: 'Failed to update settings.' };
    }
}