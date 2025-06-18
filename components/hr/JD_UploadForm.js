// components/hr/JD_UploadForm.js
"use client";

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createJobDescription } from '@/app/actions/jobActions';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { FaFileUpload } from 'react-icons/fa';

// The SubmitButton (now a standard HTML button)
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <md-filled-button
        type="submit"
        disabled={pending}
        className="w-full mt-4
                   md-typescale-label-large bg-button-accent-bg text-button-accent-text
                   px-6 py-3 rounded-full shadow-md
                   hover:brightness-90 transition-colors duration-200
                   disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:shadow-none disabled:cursor-not-allowed"
    >
      {pending ? 'Saving...' : 'Save Job Description'}
    </md-filled-button>
  );
}

export default function JD_UploadForm() {
  const [state, formAction] = useActionState(createJobDescription, null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileNameDisplayRef = useRef(null);

  // Effect for handling file input changes
  useEffect(() => {
    const input = fileInputRef.current;
    const display = fileNameDisplayRef.current;
    const handleFileChange = (event) => {
      const file = event.target.files?.[0];
      if (file && display) {
        display.textContent = file.name;
      } else if (display) {
        display.textContent = 'No file chosen';
      }
    };
    if (input) input.addEventListener('change', handleFileChange);
    return () => {
      if (input) input.removeEventListener('change', handleFileChange);
    };
  }, []);

  // Effect for resetting the form on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // You may need to manually clear the RichTextEditor state here as well if it doesn't reset automatically.
      if (fileNameDisplayRef.current) {
        fileNameDisplayRef.current.textContent = 'No file chosen';
      }
    }
  }, [state]);

  return (
    <div className="p-6 sm:p-8 md:p-10 bg-surface-container rounded-2xl shadow-lg border border-outline-variant max-w-2xl mx-auto my-8">
      <h2 className="md-typescale-headline-small text-on-surface mb-6 text-center">Create New Job Description</h2>
      <form ref={formRef} action={formAction} className="space-y-6">

        {/* Job Title Input (Styled as Material You text field) */}
        <div>
          <label htmlFor="title" className="block md-typescale-label-large text-on-surface-variant mb-2">Job Title</label>
          <input
            type="text"
            name="title"
            id="title"
            required
            placeholder="e.g., Senior Frontend Developer"
            className="w-full px-4 py-3
                       bg-surface-container-high text-on-surface border border-outline
                       rounded-lg shadow-sm
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container
                       md-typescale-body-large
                       transition-colors duration-200"
          />
        </div>

        {/* Description Rich Text Editor */}
        <div>
          <label htmlFor="description" className="block md-typescale-label-large text-on-surface-variant mb-2">Description (Paste or Write)</label>
          <RichTextEditor name="description" />
        </div>

        {/* OR Separator (using Material You Divider component) */}
        <div className="flex items-center my-4">
          <md-divider class="flex-grow"></md-divider> {/* Material You Divider */}
          <span className="px-4 md-typescale-label-medium text-on-surface-variant">OR</span>
          <md-divider class="flex-grow"></md-divider> {/* Material You Divider */}
        </div>

        {/* File Upload (Label styled as Material You button) */}
        <div>
          <label htmlFor="jdFile" className="block md-typescale-label-large text-on-surface-variant mb-2">Upload PDF</label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              name="jdFile"
              id="jdFile"
              accept=".pdf"
              className="hidden"
              ref={fileInputRef}
            />
            <label
              htmlFor="jdFile"
              className="inline-flex items-center
                         md-typescale-label-large bg-secondary-container text-on-secondary-container
                         px-6 py-3 rounded-full shadow-sm cursor-pointer
                         hover:bg-secondary-container-hover transition-colors duration-200"
            >
              <FaFileUpload className="mr-2 text-on-secondary-container" />
              Choose File
            </label>
            <span
              className="md-typescale-body-medium text-on-surface-variant"
              id="fileNameDisplay"
              ref={fileNameDisplayRef}
            >
              No file chosen
            </span>
          </div>
        </div>

        <SubmitButton />

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
      </form>
    </div>
  );
}