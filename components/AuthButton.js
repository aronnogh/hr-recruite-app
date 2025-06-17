// components/AuthButton.js
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

// Import Material You Web Components for buttons (assuming they're globally available via layout.js)
// We avoid direct imports here to prevent build errors, relying on the global registration.
// import '@material/web/button/filled-button.js'; // For Sign In
// import '@material/web/button/outlined-button.js'; // For Sign Out (optional, can use text-button too)
// import '@material/web/button/text-button.js'; // For Sign Out (lighter option)

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    // Material You loading state for text
    return <div className="md-typescale-label-large text-on-surface-variant">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-4"> {/* Adjusted gap for responsiveness */}
        {/* User Info (Name and Image) */}
        <div className="flex items-center gap-2">
          {/* Use Next.js Image component for optimization */}
          <Image
            src={session.user.image}
            alt={session.user.name}
            width={32}
            height={32}
            className="rounded-full border-2 border-outline" // Subtle border for Material You feel
          />
          {/* User name with Material You typography, hidden on smaller screens */}
          <span className="md-typescale-label-large text-on-surface hidden sm:inline">
            {session.user.name}
          </span>
        </div>
        {/* Sign Out Button */}
        {/* Using md-text-button for a more subtle sign-out, or md-outlined-button for more prominence */}
        <md-text-button
          onClick={() => signOut()}
          className="text-error px-3" // Use Material You error color for sign out
        >
          Sign Out
        </md-text-button>
      </div>
    );
  }

  // Sign In Button
  return (
    // Using md-filled-button for primary action (Sign In)
    <md-filled-button
      onClick={() => signIn("google")}
      className="bg-primary text-on-primary" // Explicitly use Material You primary colors
    >
      Sign in with Google
    </md-filled-button>
  );
}