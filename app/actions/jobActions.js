// app/actions/jobActions.js
"use server";

import { put } from '@vercel/blob';
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "../api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongoose';
import JobDescription from '@/models/JobDescription';

// *** THIS IS THE FIX ***
// The server action must accept two arguments when used with useActionState:
// 1. The previous state of the form.
// 2. The form's data.
export async function createJobDescription(previousState, formData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'hr') {
    return { error: 'Unauthorized' };
  }

  // The rest of the function logic remains exactly the same.
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
    const blob = await put(file.name, file, { access: 'public' });
    fileUrl = blob.url;
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

    newJd.publicUrl = `/jd/${newJd._id.toHexString()}`;
    
    await newJd.save();

    revalidatePath('/hr/dashboard');
    return { success: true, message: 'Job Description created successfully.' };

  } catch (e) {
    console.error('Failed to create Job Description:', e);
    return { error: 'Server error. Please try again.' };
  }
}