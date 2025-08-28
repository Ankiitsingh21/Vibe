"use client"

import {
        ResizableHandle,
        ResizablePanel,
        ResizablePanelGroup
} from "@/components/ui/resizable"
import { MessagesContainer } from "../components/messages-container";
import { Suspense } from "react";
import { Loader2, MessageSquare, Eye } from "lucide-react";

interface Props {
        projectId: string
}

export const ProjectViews = ({ projectId }: Props) => {  
        return (
                <div className="h-screen w-full">
                        <ResizablePanelGroup direction="horizontal" className="h-full">
                                <ResizablePanel 
                                        defaultSize={35}
                                        minSize={20}
                                        className="flex flex-col h-full"
                                >
                                        <Suspense fallback={<div>Loading Messages...</div>}>
                                           <MessagesContainer projectId={projectId}/>
                                    </Suspense>
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                <ResizablePanel
                                        defaultSize={65}
                                        minSize={50}
                                >
                                    TODO:Preview
                                </ResizablePanel>
                        </ResizablePanelGroup>
                </div>
        )
};