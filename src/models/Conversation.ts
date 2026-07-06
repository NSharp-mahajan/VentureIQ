import mongoose, { Schema, Document } from "mongoose";

export interface IConversationDocument extends Document {
  reportId: mongoose.Types.ObjectId | string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: "Report", required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

// Force mongoose to reload schema during hot reload
if (mongoose.models.Conversation) {
  delete mongoose.models.Conversation;
}
export default mongoose.model<IConversationDocument>("Conversation", ConversationSchema);
