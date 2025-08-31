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
import { CodeView } from "@/components/code-view";
import { FileExproper } from "@/components/file-explorer";

interface Props {
  projectId: string;
}

export const ProjectViews = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");

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
           <Tabs className="h-full gap-y-0" defaultValue="preview" value={tabState} onValueChange={(value) =>setTabState(value as "preview" | "code")} >
            <div className="w-full flex items-center p-2 border-b gap-x-2" >
              <TabsList className="h-8 p-0 border rounded-md" >
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon/> <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <CodeIcon/> <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2" >
                <Button size={"sm"}  asChild variant={"default"}>
                  <Link href={"/pricing"} >
                    <CrownIcon/>Upgrade
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value="preview" >
               {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value="code"  className="min-h-0" >
              {!!activeFragment?.files && (
                <FileExproper files={activeFragment.files as {[path:string]:string}} />
              )}
            </TabsContent>
         </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
