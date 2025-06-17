// app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

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
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, the 'user' object from the database is available.
      if (user) {
        token.id = user.id;
        token.role = user.role; // This will be `null` for a new user.
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
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };