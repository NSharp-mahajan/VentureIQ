import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import WorkspaceInvitation from "@/models/WorkspaceInvitation";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) return new NextResponse("Unauthorized", { status: 401 });
    
    // Get all email addresses associated with this user
    const emails = user.emailAddresses.map((e) => e.emailAddress);

    const { invitationId } = await req.json();
    if (!invitationId) return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 });

    await connectDB();

    const invitation = await WorkspaceInvitation.findById(invitationId);
    if (!invitation) return new NextResponse("Not Found", { status: 404 });

    if (invitation.status !== "PENDING") {
      return new NextResponse("Invitation is no longer valid", { status: 400 });
    }

    if (!emails.includes(invitation.email)) {
      return new NextResponse("Forbidden: Email does not match", { status: 403 });
    }

    // Check if already a member
    const existingMember = await WorkspaceMember.findOne({ workspaceId: invitation.workspaceId, userId });
    
    if (!existingMember) {
      await WorkspaceMember.create({
        workspaceId: invitation.workspaceId,
        userId,
        role: "MEMBER",
      });

      await Activity.create({
        workspaceId: invitation.workspaceId,
        userId,
        action: "Joined Workspace",
        metadata: { method: "invitation" },
      });
    }

    invitation.status = "ACCEPTED";
    await invitation.save();

    return NextResponse.json({ success: true, workspaceId: invitation.workspaceId });
  } catch (error) {
    console.error("Accept Invitation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) return new NextResponse("Unauthorized", { status: 401 });
    
    const emails = user.emailAddresses.map((e) => e.emailAddress);

    await connectDB();

    const invitations = await WorkspaceInvitation.find({ email: { $in: emails }, status: "PENDING" }).populate("workspaceId");
    
    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Fetch Pending Invitations Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
