// app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

export const authOptions = {
  // The adapter is still used to persist user and account information.
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // *** THIS IS THE KEY CHANGE ***
  // Use a JWT strategy for session management.
  // This is required for the middleware to work correctly.
  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * The `jwt` callback is now invoked on every sign-in, and when the session is accessed.
     * We enrich the token with the data our app and middleware need.
     */
    async jwt({ token, user, account, trigger, session }) {
      // On initial sign-in, the 'user' object from the database is available.
      if (user) {
        token.id = user.id;
        token.role = user.role; // This will be `null` for a new user.
      }
      
      // The 'account' object is only available on the initial sign-in.
      // This is the perfect place to create the Supabase session.
      if (account) {
        const supabaseSessionId = randomUUID();
        const { error } = await supabase.from("sessions").insert({
          userId: user.id,
          sessionId: supabaseSessionId,
          active: true,
          startedAt: new Date().toISOString(),
        });

        if (error) {
          console.error("Supabase session creation error:", error);
        } else {
          // Add the supabase session ID to the JWT itself.
          token.supabaseSessionId = supabaseSessionId;
        }
      }
      
      // This allows us to manually update the session token, for example after a role update
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      return token;
    },

    /**
     * The `session` callback receives the token from the `jwt` callback.
     * We use it to populate the client-side session object.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        // Do NOT expose the supabase session ID to the client-side session object
      }
      return session;
    },
  },

  events: {
    /**
     * On first login, set the default role to null. This still works perfectly.
     */
    async createUser({ user }) {
      const client = await clientPromise;
      const db = client.db();
      await db.collection("users").updateOne(
        { _id: user.id },
        { $set: { role: null } }
      );
    },

    /**
     * On sign-out, the `token` from the JWT is available. We use it to
     * find our Supabase session and mark it as inactive.
     */
    async signOut({ token }) {
      if (token.supabaseSessionId) {
        const { error } = await supabase
          .from("sessions")
          .update({ active: false, endedAt: new Date().toISOString() })
          .eq("sessionId", token.supabaseSessionId);

        if (error) {
          console.error("Supabase signOut event error:", error);
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };