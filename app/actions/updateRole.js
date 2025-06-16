// app/actions/updateRole.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // <-- 1. IMPORT ObjectId

export async function updateUserRole(role) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  if (role !== "hr" && role !== "applie") {
    return { error: "Invalid role selected." };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // 2. CONVERT the string ID from the session back to a MongoDB ObjectId
    const userId = new ObjectId(session.user.id);

    const result = await db.collection("users").updateOne(
      { _id: userId }, // <-- 3. USE the correct ObjectId in the query
      { $set: { role: role } }
    );

    if (result.modifiedCount === 0) {
      // This might happen if the user somehow re-submits the same role
      // Or if the user ID wasn't found (which is unlikely if they are logged in)
      console.warn(`Role update for user ${userId} resulted in 0 modifications.`);
      // We can still return success because the end state is what we want.
      // Or you can return an error: return { error: "Could not find user to update." };
    }

    return { success: true, role };
  } catch (e) {
    console.error("Failed to update role in database:", e);
    return { error: "A server error occurred while updating your role." };
  }
}