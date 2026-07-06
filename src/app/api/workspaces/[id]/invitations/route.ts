import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import WorkspaceInvitation from "@/models/WorkspaceInvitation";
import Activity from "@/models/Activity";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    if (!membership) return new NextResponse("Forbidden", { status: 403 });

    const invitations = await WorkspaceInvitation.find({ workspaceId: resolvedParams.id });
    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Fetch Invitations Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const invitation = await WorkspaceInvitation.create({
      workspaceId: resolvedParams.id,
      email,
      invitedBy: userId,
    });

    await Activity.create({
      workspaceId: resolvedParams.id,
      userId,
      action: "Invited User",
      metadata: { email },
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Create Invitation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("invitationId");
    if (!invitationId) return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const invitation = await WorkspaceInvitation.findOneAndDelete({ _id: invitationId, workspaceId: resolvedParams.id });

    if (invitation) {
      await Activity.create({
        workspaceId: resolvedParams.id,
        userId,
        action: "Revoked Invitation",
        metadata: { email: invitation.email },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke Invitation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
