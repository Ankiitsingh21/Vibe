import { Sandbox } from "@e2b/code-interpreter";
import { openai, createAgent, createTool, createNetwork, type Tool } from "@inngest/agent-kit";
import { z } from "zod";

import { PROMPT } from "@/prompt";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { prisma } from "@/lib/db";

interface AgentState{
  summary:string,
  files:{[path:string]:string}
}

export const CodeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    // Create sandbox
    const sandboxId = await step.run("get_sandbox_id", async () => {
    const sandbox = await Sandbox.create("vibe-nextjs-test-2025");
    return sandbox.sandboxId;
    });

    // Define the coding agent
    const codeAgent = createAgent<AgentState>({
      name: "code_agent",
      description: "An expert coding Agent",
      system: PROMPT,
      model: openai({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
      }),
      tools: [
        // Terminal Tool
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }) => {
            return await step.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `command failed ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`
                );
                return `command failed ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        // Create or Update Files Tool
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox.",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }: Tool.Options<AgentState> ) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
              } catch (error) {
                return "Error" + error;
              }
            });

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),

        // Read Files Tool
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }) => {
            return await step.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (error) {
                return "Error" + error;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    // Create network
    const network = createNetwork<AgentState>({
      name: "coding_agent_network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    // Run the agent
    const result = await network.run(event.data.value);
    const isError = 
      !result.state.data.summary ||
       Object.keys(result.state.data.files || {}).length === 0;

    // Get sandbox URL
    const sandboxUrl = await step.run("get_sandbox_url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result",async()=>{
      if(isError){
        return await prisma.message.create({
          data:{
            content:"The agent failed to complete the task. Please try again.",
            role:"ASSISTANT",
            type:"ERROR",
          }
        })
      }
      const files = result.state.data.files || {};
      const summary = result.state.data.summary || "Task completed successfully";
      console.log("Saving result with data:", {
      summary,
      filesCount: Object.keys(files).length,
      sandboxUrl
    });
      return await prisma.message.create({
        data:{
          content:summary,
          role:"ASSISTANT",
          type:"RESULT",
          fragment:{
            create:{
              sandboxUrl: sandboxUrl,
              title: "Fragment",
              files: files,
            },
          }
        }
      })
    })

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);