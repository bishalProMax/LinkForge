export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

export interface ToolContext {
  userId: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
}