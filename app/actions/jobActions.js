// app/actions/jobActions.js
"use server";

import { put } from '@vercel/blob';
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "../api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongoose';
import JobDescription from '@/models/JobDescription';

// The server action must accept two arguments when used with useActionState
export async function createJobDescription(previousState, formData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'hr') {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title');
  const description = formData.get('description');
  const file = formData.get('jdFile');

  if (!title || (!description && !file)) {
    return { error: 'Title and either a description or a file are required.' };
  }

  let fileUrl = '';
  let descriptionText = description;

  if (file && file.size > 0) {
    if (file.type !== 'application/pdf') {
        return { error: 'Only PDF files are allowed.' };
    }
    
    // --- THIS IS THE FIX ---
    // Add `addRandomSuffix: true` to the options object.
    // This will automatically append a random suffix to the filename,
    // ensuring it is unique and preventing overwrite errors.
    const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true,
    });
    // --- END OF FIX ---

    fileUrl = blob.url;
    // In a real app, you would parse the PDF text here and set descriptionText
    descriptionText = descriptionText || `Details are in the uploaded PDF: ${file.name}`;
  }
  
  try {
    await dbConnect();

    const newJd = new JobDescription({
      hrId: session.user.id,
      title,
      descriptionText,
      uploadedFileUrl: fileUrl,
    });

    // We set the publicUrl after saving to get the document's ID
    newJd.publicUrl = `/jd/${newJd._id.toHexString()}`;
    
    await newJd.save();

    revalidatePath('/hr/dashboard'); // Refresh the dashboard to show the new JD
    return { success: true, message: 'Job Description created successfully.' };

  } catch (e) {
    console.error('Failed to create Job Description:', e);
    return { error: 'Server error. Please try again.' };
  }
}