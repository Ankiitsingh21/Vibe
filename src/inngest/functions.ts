import {Sandbox} from "@e2b/code-interpreter";
import { openai, createAgent } from "@inngest/agent-kit";


import { inngest } from "./client";
import { getSandBox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id",async()=>{
      const sandbox =await Sandbox.create("vibe-nextjs-test-2025");
      return sandbox.sandboxId;
    })
    const codeAgent = createAgent({
      name: "code-agent",
      system: "",
      model: openai({
        model: "gemini-2.5-flash",  // Gemini model name
        apiKey: process.env.GEMINI_API_KEY, 
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/", // Gemini's OpenAI-compatible endpoint
      }),
    });

    const { output } = await codeAgent.run(
      `${event.data.value}`
    );

    const sendboxUrl = await step.run(
      "get-sandbox-url",
      async () => {
        const sandbox = await getSandBox(sandboxId);
        const host =  sandbox.getHost(3000);
        return `https://${host}`;
      }
    )

    return { output  , sendboxUrl};
  }
);
