import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const clerkId = user.id;
    const email = user.emailAddresses[0]?.emailAddress;
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const imageUrl = user.imageUrl;

    let dbUser = await User.findOne({ clerkId });

    if (!dbUser) {
      dbUser = await User.create({
        clerkId,
        email,
        fullName,
        imageUrl,
      });
    } else {
      dbUser.email = email;
      dbUser.fullName = fullName;
      dbUser.imageUrl = imageUrl;
      await dbUser.save();
    }

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
