import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  role: "system" | "user" | "assistant" | "data";
  content: string;
  createdAt: Date;
}

export interface IConversationDocument extends Document {
  reportId: mongoose.Types.ObjectId | string;
  userId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ["system", "user", "assistant", "data"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema<IConversationDocument>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: "Report", required: true, index: true },
    userId: { type: String, required: true, index: true },
    messages: [MessageSchema],
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
