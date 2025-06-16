// components/hr/JD_UploadForm.js
"use client";

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createJobDescription } from '@/app/actions/jobActions';
import RichTextEditor from '../ui/RichTextEditor'; // <-- IMPORT THE NEW COMPONENT

// ... (SubmitButton component is unchanged) ...
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
    >
      {/* The text changes based on the pending state */}
      {pending ? 'Saving...' : 'Save Job Description'} 
    </button>
  );
}

export default function JD_UploadForm() {
  const [state, formAction] = useActionState(createJobDescription, null);
  const formRef = useRef(null);
  
  useEffect(() => {
    if (state?.success) {
        formRef.current?.reset();
        // We might need to manually reset the editor as well if it holds state
        // For now, form reset is a good start
    }
  }, [state]);

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">Create New Job Description</h2>
      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">Job Title</label>
          <input type="text" name="title" id="title" required className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        
        {/* --- THIS IS THE CHANGE --- */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description (Paste or Write)</label>
          <RichTextEditor name="description" />
        </div>
        {/* --- END OF CHANGE --- */}

        <div className="text-center my-2 text-gray-400">OR</div>
        <div>
          <label htmlFor="jdFile" className="block text-sm font-medium text-gray-300">Upload PDF</label>
          <input type="file" name="jdFile" id="jdFile" accept=".pdf" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"/>
        </div>
        <SubmitButton />
        {state?.error && <p className="text-red-500 mt-2">{state.error}</p>}
        {state?.success && <p className="text-green-500 mt-2">{state.message}</p>}
      </form>
    </div>
  );
}