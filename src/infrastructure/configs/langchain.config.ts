import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.7-flash",
  temperature: 0.3,
});

export default chatModel;