// components/DynamicThemeToggleClient.js
"use client"; // This component MUST be a Client Component

import dynamic from "next/dynamic";

// Dynamically import ThemeToggle with SSR disabled within a client component
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), { ssr: false });

export default function DynamicThemeToggleClient() {
  return <ThemeToggle />;
}