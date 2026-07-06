import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const reports = await Report.find({ 
      userId: user.id, 
      status: "completed",
      deletedAt: null
    }).select("_id companyName aiScore reportData.investmentScore reportData.investmentVerdict.label verdict createdAt").sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports list:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
