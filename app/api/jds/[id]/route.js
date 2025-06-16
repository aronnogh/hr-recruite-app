// app/api/jds/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import JobDescription from "@/models/JobDescription";
import { ObjectId } from "mongodb";

// The signature changes slightly from (req, { params }) to just (req)
export async function GET(req) {
    // *** THIS IS THE FIX ***
    // We get the params from the request's URL object
    const url = new URL(req.url);
    // The last part of the pathname is the dynamic ID
    const id = url.pathname.split('/').pop();
    // *** END OF FIX ***

    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    try {
        await dbConnect();
        // Use the extracted 'id' variable in the query
        const jd = await JobDescription.findById(id); 
        if (!jd) {
            return NextResponse.json({ error: "Job Description not found" }, { status: 404 });
        }
        return NextResponse.json(jd);
    } catch (e) {
        console.error("Failed to fetch JD:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}