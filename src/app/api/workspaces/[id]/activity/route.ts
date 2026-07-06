import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import Activity from "@/models/Activity";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    if (!membership) return new NextResponse("Forbidden", { status: 403 });

    const activities = await Activity.find({ workspaceId: resolvedParams.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Fetch Activity Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
