import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";

interface Props {
        projectId: string
}

export const MessagesContainer = ({ projectId }: Props) => {
        const bottomRef = useRef<HTMLDivElement>(null);
        const trpc = useTRPC();
        
        const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
                projectId: projectId
        }));

        useEffect(()=>{
                const lastAssistantMessage = messages.findLast(
                        (message)=>message.role === "ASSISTANT",
                );
                if(lastAssistantMessage){
                        //TODO SETACTIVE FRAGMENT
                }
        },[messages])

        useEffect(()=>{
                bottomRef.current?.scrollIntoView({behavior:"smooth"});
        },[messages.length])

        return (
                <div className="flex flex-col h-full" >
                        <div className="flex-1 overflow-y-auto" >
                                <div className="pt-4 pr-1" >
                                        {messages.map((message)=>(
                                                <MessageCard
                                                  key={message.id}
                                                  content = {message.content}
                                                  role = {message.role}
                                                  fragment = {message.fragment}
                                                  createdAt = {message.createdAt}
                                                  isActiveFragement = {false}
                                                  onFragmentClick={()=>{}}
                                                  type={message.type}
                                                />
                                        ))}
                                        <div ref={bottomRef} />
                                </div>
                        </div>
                               <div className="relative px-3 pb-3 pt-1">
                                 <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70" />
                                 <MessageForm projectId={projectId} />
                               </div>
                </div>
        )
};