// components/ui/RichTextEditor.js
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRef } from 'react';

// Import Material You Icons (assuming they are globally available via layout.js)
// We avoid direct imports here to prevent build errors, relying on the global registration.
// import '@material/web/icon/icon.js'; // Not needed if already imported in all.js

// Import React Icons for additional toolbar options
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaHeading,
  FaStrikethrough, // New: Strikethrough
  FaCode,           // New: Code
  FaQuoteLeft,      // New: Blockquote
  FaRedo,           // New: Redo
  FaUndo,           // New: Undo
  FaParagraph,      // New: Paragraph
  FaHighlighter,    // New: Mark/Highlight
} from 'react-icons/fa';


// A simple toolbar component
const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Helper to apply active styles to buttons
  // Using Material You color variables for active/inactive states
  const activeClass = "bg-primary text-on-primary shadow-sm"; // Primary for active, with subtle shadow
  const inactiveClass = "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"; // High surface for inactive

  return (
    <div className="flex flex-wrap gap-1 p-2 border border-outline-variant rounded-t-lg bg-surface-container-low shadow-sm">
      {/* Basic Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('bold') ? activeClass : inactiveClass}`}
        type="button" // Important for buttons inside forms
      >
        <FaBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('italic') ? activeClass : inactiveClass}`}
        type="button"
      >
        <FaItalic />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()} // New: Strikethrough
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('strike') ? activeClass : inactiveClass}`}
        type="button"
      >
        <FaStrikethrough />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()} // New: Code
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('code') ? activeClass : inactiveClass}`}
        type="button"
      >
        <FaCode />
      </button>
       <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()} // New: Blockquote
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('blockquote') ? activeClass : inactiveClass}`}
        type="button"
      >
        <FaQuoteLeft />
      </button>
       <button
        onClick={() => editor.chain().focus().setMark('highlight').run()} // New: Mark/Highlight
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('highlight') ? activeClass : inactiveClass}`}
        type="button"
      >
        <FaHighlighter />
      </button>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('bulletList') ? activeClass : inactiveClass}`}
        type="button"
      >
        <FaListUl />
      </button>
       <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()} // New: Ordered List
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('orderedList') ? activeClass : inactiveClass}`}
        type="button"
      >
        <FaListUl className="rotate-90" /> {/* Reusing FaListUl and rotating */}
      </button>

      {/* Headings / Paragraph */}
      <button
        onClick={() => editor.chain().focus().setParagraph().run()} // New: Back to Paragraph
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('paragraph') ? activeClass : inactiveClass}`}
        type="button"
      >
        <FaParagraph />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('heading', { level: 2 }) ? activeClass : inactiveClass}`}
        type="button"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded-md md-typescale-label-large ${editor.isActive('heading', { level: 3 }) ? activeClass : inactiveClass}`}
        type="button"
      >
        H3
      </button>

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`p-2 rounded-md md-typescale-label-large ${!editor.can().undo() ? 'opacity-50 cursor-not-allowed' : inactiveClass}`}
        type="button"
      >
        <FaUndo />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`p-2 rounded-md md-typescale-label-large ${!editor.can().redo() ? 'opacity-50 cursor-not-allowed' : inactiveClass}`}
        type="button"
      >
        <FaRedo />
      </button>
    </div>
  );
};


export default function RichTextEditor({ name, placeholder }) {
  const hiddenInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Keep existing heading levels
        heading: { levels: [2, 3] },
        // Ensure new extensions are enabled if StarterKit disables them by default
        // e.g., CodeBlock, Blockquote, Strike, Highlight, OrderedList
        // If they are not included in StarterKit, you'd import them separately:
        // import CodeBlock from '@tiptap/extension-code-block';
        // import Blockquote from '@tiptap/extension-blockquote';
        // import Strike from '@tiptap/extension-strike';
        // import Highlight from '@tiptap/extension-highlight';
        // import OrderedList from '@tiptap/extension-ordered-list';
      }),
    ],
    content: '', // Initial content
    editorProps: {
      attributes: {
        // Apply Material You Tailwind classes to the editor itself
        class: 'prose prose-invert max-w-none p-4 min-h-[200px] bg-surface-container-highest border border-outline-variant rounded-b-lg focus:outline-none focus:border-primary-container text-on-surface md-typescale-body-large',
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