// components/hr/JD_UploadForm.js
"use client";

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createJobDescription } from '@/app/actions/jobActions';
import RichTextEditor from '../ui/RichTextEditor';

// Import the specific React Icon you want to use
import { FaFileUpload } from 'react-icons/fa'; // Example: Font Awesome File Upload icon

// ... (SubmitButton component remains the same, as its UI is handled by Material You) ...
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <md-filled-button type="submit" disabled={pending} class="w-full mt-4"> {/* Material You Filled Button */}
      {pending ? 'Saving...' : 'Save Job Description'}
    </md-filled-button>
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
    <div className="p-6 sm:p-8 md:p-10 bg-surface-container rounded-2xl shadow-lg border border-outline-variant max-w-2xl mx-auto my-8">
      <h2 className="md-typescale-headline-small text-on-surface mb-6 text-center">Create New Job Description</h2>
      <form ref={formRef} action={formAction} className="space-y-6">
        {/* Job Title Input */}
        <div>
          <md-filled-textfield
            label="Job Title"
            type="text"
            name="title"
            id="title"
            required
            class="w-full"
          ></md-filled-textfield>
        </div>

        {/* Description Rich Text Editor */}
        <div>
          <label htmlFor="description" className="block md-typescale-label-large text-on-surface-variant mb-2">Description (Paste or Write)</label>
          <RichTextEditor name="description" />
        </div>

        {/* OR Separator with Material You Divider */}
        <div className="flex items-center my-4">
          <md-divider class="flex-grow"></md-divider>
          <span className="px-4 md-typescale-label-medium text-on-surface-variant">OR</span>
          <md-divider class="flex-grow"></md-divider>
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="jdFile" className="block md-typescale-label-large text-on-surface-variant mb-2">Upload PDF</label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              name="jdFile"
              id="jdFile"
              accept=".pdf"
              className="hidden"
            />
            <label
              htmlFor="jdFile"
              className="inline-flex items-center px-4 py-2 rounded-full md-typescale-label-large cursor-pointer
                         bg-secondary-container text-on-secondary-container hover:bg-secondary-container-hover
                         transition-colors duration-200 shadow-sm"
            >
              {/* Replaced <md-icon> with FaFileUpload from react-icons */}
              <FaFileUpload className="mr-2 text-on-secondary-container" /> {/* Apply text color from Tailwind/Material You */}
              Choose File
            </label>
            <span className="md-typescale-body-medium text-on-surface-variant" id="fileNameDisplay">
              No file chosen
            </span>
          </div>
        </div>

        <SubmitButton />

        {/* State messages (success/error) */}
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
      </form>
    </div>
  );
}