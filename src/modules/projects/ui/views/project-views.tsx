"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/project-head";
import { FragmentWeb } from "../components/fragment-web";

interface Props {
  projectId: string;
}

export const ProjectViews = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  
  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
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

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={65} minSize={50}>
          {activeFragment && <FragmentWeb data={activeFragment} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};