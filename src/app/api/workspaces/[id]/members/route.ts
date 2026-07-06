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

    const members = await WorkspaceMember.find({ workspaceId: resolvedParams.id });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Fetch Members Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { targetUserId, role } = await req.json();
    if (!targetUserId || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (membership.role === "ADMIN" && role === "OWNER") {
      return new NextResponse("Admins cannot make someone an OWNER", { status: 403 });
    }

    const updatedMember = await WorkspaceMember.findOneAndUpdate(
      { workspaceId: resolvedParams.id, userId: targetUserId },
      { role },
      { new: true }
    );

    await Activity.create({
      workspaceId: resolvedParams.id,
      userId,
      action: `Updated role to ${role}`,
      metadata: { targetUserId },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Update Member Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("targetUserId");
    if (!targetUserId) return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    const targetMembership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId: targetUserId });

    if (!membership || !targetMembership) return new NextResponse("Not Found", { status: 404 });
    
    if (userId !== targetUserId) {
      if (membership.role === "MEMBER") return new NextResponse("Forbidden", { status: 403 });
      if (membership.role === "ADMIN" && (targetMembership.role === "OWNER" || targetMembership.role === "ADMIN")) {
        return new NextResponse("Admins cannot remove other admins or owners", { status: 403 });
      }
    }

    if (targetMembership.role === "OWNER") {
      return new NextResponse("Cannot remove the owner", { status: 400 });
    }

    await WorkspaceMember.findOneAndDelete({ workspaceId: resolvedParams.id, userId: targetUserId });

    await Activity.create({
      workspaceId: resolvedParams.id,
      userId,
      action: userId === targetUserId ? "Left Workspace" : "Removed Member",
      metadata: { targetUserId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Member Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
