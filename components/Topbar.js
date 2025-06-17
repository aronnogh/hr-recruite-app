// components/Topbar.js
"use client"; // This directive is correct and necessary because it renders custom elements.

import AuthButton from "@/components/AuthButton";

export default function Topbar() {
  return (
    <header className="w-full bg-surface-container-high border-b border-outline-variant p-4 flex justify-between items-center relative">
      <md-elevation></md-elevation> {/* This component is the culprit for hydration errors if SSR'd */}

      <h1 className="md-typescale-title-large text-on-surface">
        AI Recruitment Platform
      </h1>

      <div>
        <AuthButton />
      </div>
    </header>
  );
}