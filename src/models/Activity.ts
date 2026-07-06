import mongoose, { Schema, Document } from "mongoose";

export interface IActivityDocument extends Document {
  workspaceId: mongoose.Types.ObjectId | string;
  userId: string;
  action: string; // e.g., "Created Report", "Commented", "Joined Workspace"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    userId: { type: String, required: true },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

if (mongoose.models.Activity) {
  delete mongoose.models.Activity;
}
export default mongoose.model<IActivityDocument>("Activity", ActivitySchema);
