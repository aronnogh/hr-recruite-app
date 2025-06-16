// components/ui/RichTextEditor.js
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRef } from 'react';

// A simple toolbar component
const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Helper to apply active styles to buttons
  const activeClass = "bg-blue-600 text-white";
  const inactiveClass = "bg-gray-700 hover:bg-gray-600 text-gray-300";

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-gray-600 rounded-t-md bg-gray-800">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1 rounded ${editor.isActive('bold') ? activeClass : inactiveClass}`}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1 rounded ${editor.isActive('italic') ? activeClass : inactiveClass}`}>I</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-3 py-1 rounded ${editor.isActive('bulletList') ? activeClass : inactiveClass}`}>List</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? activeClass : inactiveClass}`}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 3 }) ? activeClass : inactiveClass}`}>H3</button>
    </div>
  );
};


export default function RichTextEditor({ name, placeholder }) {
  const hiddenInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions you don't need
        heading: { levels: [2, 3] },
      }),
    ],
    content: '', // Initial content
    editorProps: {
      attributes: {
        // Apply Tailwind classes to the editor itself
        class: 'prose prose-invert max-w-none p-4 min-h-[200px] bg-gray-900 border border-gray-600 rounded-b-md focus:outline-none focus:border-blue-500',
      },
    },
    onUpdate: ({ editor }) => {
      // On every keystroke, update the hidden input's value with the editor's HTML
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = editor.getHTML();
      }
    },
  });

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {/* This hidden input will hold the HTML and be submitted with the form */}
      <input type="hidden" name={name} ref={hiddenInputRef} />
    </div>
  );
}