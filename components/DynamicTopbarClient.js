// components/DynamicTopbarClient.js
"use client"; // This component MUST be a Client Component

import dynamic from "next/dynamic";

// Dynamically import Topbar with SSR disabled within a client component
const Topbar = dynamic(() => import("@/components/Topbar"), { ssr: false });

export default function DynamicTopbarClient() {
  return <Topbar />;
}