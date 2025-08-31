// src/modules/projects/ui/views/project-views.tsx
"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/project-head";
import { FragmentWeb } from "../components/fragment-web";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";

interface Props {
  projectId: string;
}

export const ProjectViews = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");

  return (
    <div className="h-screen w-full flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col h-full"
        >
          {/* Fixed header - doesn't scroll */}
          <div className="shrink-0">
            <Suspense fallback={<div className="p-2 border-b">Loading...</div>}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </div>

          {/* Scrollable messages area */}
          <div className="flex-1 min-h-0">
            <Suspense fallback={<div>Loading Messages...</div>}>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </div>
        </ResizablePanel>

        <ResizableHandle className="hover:bg-primary transition-colors" />

        <ResizablePanel defaultSize={65} minSize={50} className="flex flex-col">
          <Tabs 
            className="flex flex-col h-full" 
            defaultValue="preview" 
            value={tabState} 
            onValueChange={(value) => setTabState(value as "preview" | "code")}
          >
            {/* Fixed tabs header */}
            <div className="w-full flex items-center p-2 border-b gap-x-2 shrink-0">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <CodeIcon className="w-4 h-4 mr-1" />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                <Button size={"sm"} asChild variant={"tertiary"}>
                  <Link href={"/pricing"}>
                    <CrownIcon className="w-4 h-4 mr-1" />
                    Upgrade
                  </Link>
                </Button>
              </div>
            </div>

            {/* Tab content - takes remaining space */}
            <div className="flex-1 min-h-0">
              <TabsContent value="preview" className="h-full m-0">
                {!!activeFragment && <FragmentWeb data={activeFragment} />}
              </TabsContent>
              
              <TabsContent value="code" className="h-full m-0">
                {!!activeFragment?.files && (
                  <FileExplorer files={activeFragment.files as {[path:string]:string}} />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};