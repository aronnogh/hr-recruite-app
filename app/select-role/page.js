// app/select-role/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // <-- Make sure this is imported
import { updateUserRole } from "../actions/updateRole";

// ... (RoleSelectionCard component is unchanged) ...

export default function SelectRolePage() {
  const { data: session, update } = useSession(); // <-- Get the `update` function
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleRoleSelect = async (role) => {
    setIsUpdating(true);
    setError(null);
    
    const result = await updateUserRole(role);

    if (result.error) {
      setError(result.error);
      setIsUpdating(false);
    } else if (result.success) {
      // *** THIS IS THE KEY CHANGE ***
      // Manually trigger a session update to refresh the JWT with the new role.
      await update({ role: result.role });

      // Now redirect. The middleware will have the fresh token.
      const targetDashboard = result.role === 'hr' ? '/hr/dashboard' : '/dashboard';
      router.push(targetDashboard);
      router.refresh(); // Recommended to ensure server components re-render
    }
  };

  // ... (the rest of the component is unchanged) ...

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Choose Your Role</h1>
        <p className="mt-2 text-gray-400">
          Welcome, {session.user.name}! Please select a role to continue.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-10">
        <RoleSelectionCard
          role="applie"
          title="Applie"
          description="I am a candidate looking for job opportunities and applying to positions."
          onSelect={handleRoleSelect}
          isUpdating={isUpdating}
        />
        <RoleSelectionCard
          role="hr"
          title="HR Professional"
          description="I am part of a company, looking to post jobs and manage applications."
          onSelect={handleRoleSelect}
          isUpdating={isUpdating}
        />
      </div>

      {isUpdating && <p className="mt-6 text-blue-400">Updating your role...</p>}
      {error && <p className="mt-6 text-red-500">Error: {error}</p>}
    </div>
  );
}

function RoleSelectionCard({ role, title, description, onSelect, isUpdating }) {
    return (
      <button
        onClick={() => onSelect(role)}
        disabled={isUpdating}
        className="p-8 border-2 border-gray-700 rounded-lg text-left hover:bg-gray-800 hover:border-blue-500 transition-all w-full md:w-96 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <h3 className="text-2xl font-bold text-blue-400">{title}</h3>
        <p className="mt-2 text-gray-400">{description}</p>
      </button>
    );
}