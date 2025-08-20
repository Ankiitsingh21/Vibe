import { openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const codeAgent = createAgent({
      name: "code-agent",
      system: "",
      model: openai({
        model: "gemini-1.5-flash-8b", // ✅ Free-tier Gemini model
        apiKey: process.env.GEMINI_API_KEY, // store in .env
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/", 
      }),
    });

    const { output } = await codeAgent.run(
      `${event.data.value}`
    );

    return { output };
  }
);
