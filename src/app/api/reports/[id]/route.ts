import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import WorkspaceMember from "@/models/WorkspaceMember";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    if (!id) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    await connectDB();

    const report = await Report.findById(id).lean();

    if (!report || report.deletedAt) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.userId !== user.id) {
      if (!report.workspaceId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const membership = await WorkspaceMember.findOne({ workspaceId: report.workspaceId, userId: user.id });
      if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;
    if (!id) return NextResponse.json({ error: "Report ID required" }, { status: 400 });

    const { action } = await req.json();

    await connectDB();

    const report = await Report.findById(id);
    if (!report || report.deletedAt) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    if (report.userId !== user.id) {
      if (!report.workspaceId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const membership = await WorkspaceMember.findOne({ workspaceId: report.workspaceId, userId: user.id });
      if (!membership || membership.role === "MEMBER") {
        return NextResponse.json({ error: "Forbidden: Admins or Owners only" }, { status: 403 });
      }
    }

    switch (action) {
      case "save":
        report.isSaved = true;
        break;
      case "unsave":
        report.isSaved = false;
        break;
      case "archive":
        report.isArchived = true;
        break;
      case "unarchive":
        report.isArchived = false;
        break;
      case "delete":
        report.deletedAt = new Date();
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await report.save();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
