// src/inngest/functions.ts - CORRECT syntax for Inngest v3.40.1

import { Sandbox } from "@e2b/code-interpreter";
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  type Tool,
} from "@inngest/agent-kit";
import { z } from "zod";

import { PROMPT } from "@/prompt";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const CodeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    // ✅ OPTION 1: Use the correct timeout object syntax
    timeouts: { start: "15m" },
  },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    // Create sandbox with extended timeout
    const sandboxId = await step.run("get_sandbox_id", async () => {
      console.log("🚀 Creating sandbox with extended timeout...");
      const sandbox = await Sandbox.create("vibe-nextjs-test-2025", {
        timeoutMs: 20 * 60 * 1000, // 20 minutes
      });
      console.log(`✅ Sandbox created: ${sandbox.sandboxId}`);
      return sandbox.sandboxId;
    });

    // Heartbeat mechanism to keep sandbox alive
    const heartbeatInterval = setInterval(
      async () => {
        try {
          const sandbox = await getSandbox(sandboxId);
          await sandbox.commands.run("echo 'heartbeat'");
          console.log("💓 Sandbox heartbeat sent");
        } catch (error) {
          console.warn("⚠️ Heartbeat failed:", error);
        }
      },
      2 * 60 * 1000,
    ); // Every 2 minutes

    try {
      const codeAgent = createAgent<AgentState>({
        name: "code_agent",
        description: "An expert coding Agent",
        system: PROMPT,
        model: openai({
          model: "gemini-2.5-flash-lite",
          apiKey: process.env.GEMINI_API_KEY,
          baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
        }),
        tools: [
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
                  console.log(`🔧 Executing command: ${command}`);
                  const sandbox = await getSandbox(sandboxId);

                  const result = await sandbox.commands.run(command, {
                    onStdout: (data: string) => {
                      buffers.stdout += data;
                    },
                    onStderr: (data: string) => {
                      buffers.stderr += data;
                    },
                    timeoutMs: 5 * 60 * 1000, // 5 minutes per command
                  });
                  console.log(`✅ Command completed: ${command}`);
                  return result.stdout;
                } catch (e) {
                  console.error(`❌ Command failed: ${command}`, e);
                  return `command failed ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
                }
              });
            },
          }),

          createTool({
            name: "createOrUpdateFiles",
            description: "Create or update files in the sandbox.",
            parameters: z.object({
              files: z.array(
                z.object({
                  path: z.string(),
                  content: z.string(),
                }),
              ),
            }),
            handler: async (
              { files },
              { step, network }: Tool.Options<AgentState>,
            ) => {
              const newFiles = await step?.run(
                "createOrUpdateFiles",
                async () => {
                  try {
                    console.log(`📝 Creating/updating ${files.length} files`);
                    const updatedFiles = network.state.data.files || {};
                    const sandbox = await getSandbox(sandboxId);

                    for (const file of files) {
                      await sandbox.files.write(file.path, file.content);
                      updatedFiles[file.path] = file.content;
                      console.log(`✅ File updated: ${file.path}`);
                    }
                    return updatedFiles;
                  } catch (error) {
                    console.error("❌ File operation failed:", error);
                    return "Error" + error;
                  }
                },
              );

              if (typeof newFiles === "object") {
                network.state.data.files = newFiles;
              }
            },
          }),

          createTool({
            name: "readFiles",
            description: "Read files from the sandbox",
            parameters: z.object({
              files: z.array(z.string()),
            }),
            handler: async ({ files }) => {
              return await step.run("readFiles", async () => {
                try {
                  console.log(`📖 Reading ${files.length} files`);
                  const sandbox = await getSandbox(sandboxId);
                  const contents = [];
                  for (const file of files) {
                    const content = await sandbox.files.read(file);
                    contents.push({ path: file, content });
                  }
                  return JSON.stringify(contents);
                } catch (error) {
                  console.error("❌ File read failed:", error);
                  return "Error" + error;
                }
              });
            },
          }),
        ],
        lifecycle: {
          onResponse: async ({ result, network }) => {
            const lastAssistantMessageText =
              lastAssistantTextMessageContent(result);
            if (lastAssistantMessageText && network) {
              if (lastAssistantMessageText.includes("<task_summary>")) {
                network.state.data.summary = lastAssistantMessageText;
              }
            }
            return result;
          },
        },
      });

      const network = createNetwork<AgentState>({
        name: "coding_agent_network",
        agents: [codeAgent],
        maxIter: 20,
        router: async ({ network }) => {
          const summary = network.state.data.summary;
          if (summary) {
            return;
          }
          return codeAgent;
        },
      });

      console.log("🤖 Starting AI agent processing...");
      const startTime = Date.now();

      const result = await network.run(event.data.value);

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      console.log(`⏱️ AI processing completed in ${processingTime}s`);

      const isError =
        !result.state.data.summary ||
        Object.keys(result.state.data.files || {}).length === 0;

      const sandboxUrl = await step.run("get_sandbox_url", async () => {
        try {
          console.log("🔗 Getting sandbox URL...");
          const sandbox = await getSandbox(sandboxId);
          const host = sandbox.getHost(3000);
          const url = `https://${host}`;
          console.log(`✅ Sandbox URL generated: ${url}`);
          return url;
        } catch (error) {
          console.error("❌ Failed to get sandbox URL:", error);
          throw new Error(`Sandbox became unavailable: ${error}`);
        }
      });

      await step.run("save-result", async () => {
        if (isError) {
          console.log("❌ Saving error result");
          return await prisma.message.create({
            data: {
              projectId: event.data.projectId,
              content:
                "The agent failed to complete the task. Please try again.",
              role: "ASSISTANT",
              type: "ERROR",
            },
          });
        }

        const files = result.state.data.files || {};
        const summary =
          result.state.data.summary || "Task completed successfully";

        console.log("💾 Saving successful result:", {
          summary,
          filesCount: Object.keys(files).length,
          sandboxUrl,
          processingTime: `${processingTime}s`,
        });

        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: summary,
            role: "ASSISTANT",
            type: "RESULT",
            fragment: {
              create: {
                sandboxUrl: sandboxUrl,
                title: "Generated Application",
                files: files,
              },
            },
          },
        });
      });

      console.log("🎉 Task completed successfully!");

      return {
        url: sandboxUrl,
        title: "Generated Application",
        files: result.state.data.files,
        summary: result.state.data.summary,
        processingTime: `${processingTime}s`,
      };
    } finally {
      clearInterval(heartbeatInterval);
      console.log("🧹 Heartbeat cleanup completed");
    }
  },
);
