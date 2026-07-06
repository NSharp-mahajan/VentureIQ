import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Report from "@/models/Report";
import WorkspaceMember from "@/models/WorkspaceMember";
import Activity from "@/models/Activity";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectDB();
    const resolvedParams = await params;

    const report = await Report.findById(resolvedParams.id);
    if (!report) return new NextResponse("Not Found", { status: 404 });

    // Check permission
    if (report.userId !== userId) {
      if (!report.workspaceId) return new NextResponse("Forbidden", { status: 403 });
      
      const membership = await WorkspaceMember.findOne({ workspaceId: report.workspaceId, userId });
      if (!membership) return new NextResponse("Forbidden", { status: 403 });
    }

    const comments = await Comment.find({ reportId: resolvedParams.id }).sort({ createdAt: 1 }).lean();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Fetch Comments Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

    await connectDB();
    const resolvedParams = await params;

    const report = await Report.findById(resolvedParams.id);
    if (!report) return new NextResponse("Not Found", { status: 404 });

    if (report.userId !== userId) {
      if (!report.workspaceId) return new NextResponse("Forbidden", { status: 403 });
      
      const membership = await WorkspaceMember.findOne({ workspaceId: report.workspaceId, userId });
      if (!membership) return new NextResponse("Forbidden", { status: 403 });
    }

    const comment = await Comment.create({
      reportId: resolvedParams.id,
      authorId: userId,
      content,
    });

    if (report.workspaceId) {
      await Activity.create({
        workspaceId: report.workspaceId,
        userId,
        action: "Commented on Report",
        metadata: { reportId: resolvedParams.id, companyName: report.companyName },
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Create Comment Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
