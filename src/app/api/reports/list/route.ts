/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import WorkspaceMember from "@/models/WorkspaceMember";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const memberships = await WorkspaceMember.find({ userId: user.id });
    const workspaceIds = memberships.map(m => m.workspaceId);

    const reports = await Report.find({ 
      $or: [
        { userId: user.id },
        { workspaceId: { $in: workspaceIds } }
      ],
      status: "completed",
      deletedAt: null
    }).select("_id companyName aiScore reportData.investmentScore reportData.investmentVerdict.label verdict createdAt workspaceId").sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports list:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
