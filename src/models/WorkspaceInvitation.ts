import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceInvitationDocument extends Document {
  workspaceId: mongoose.Types.ObjectId | string;
  email: string;
  invitedBy: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceInvitationSchema = new Schema<IWorkspaceInvitationDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    email: { type: String, required: true },
    invitedBy: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "DECLINED"], default: "PENDING" },
    expiresAt: { 
      type: Date, 
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.WorkspaceInvitation) {
  delete mongoose.models.WorkspaceInvitation;
}
export default mongoose.model<IWorkspaceInvitationDocument>("WorkspaceInvitation", WorkspaceInvitationSchema);
