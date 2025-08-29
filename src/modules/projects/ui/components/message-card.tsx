import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, Code2Icon } from "lucide-react";

interface MessageCardProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragement: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}
interface UserMessageProps {
  content: string;
}
interface AssistantMessageProps {
  content: string;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragement: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}
interface FragmentCardProps {
  fragment: Fragment;
  isActiveFragement: boolean;
  onFragmentClick: (fragment: Fragment) => void;
}

export const FragmentCard = ({
  fragment,
  isActiveFragement,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <button
      className={cn(
        "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors ",
        isActiveFragement &&
          "bg-primary text-primary-foreground border-primary hover-bg-primary ",
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <Code2Icon className="size-4 mt-0.5" />
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium line-clamp-1">
          {fragment.title}
        </span>
        <span className="text-sm"> Preview </span>
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <ChevronRightIcon className="size-4" />
      </div>
    </button>
  );
};

export const AssistantMessage = ({
  content,
  fragment,
  createdAt,
  isActiveFragement,
  onFragmentClick,
  type,
}: AssistantMessageProps) => {
  return (
    <div
      className={cn(
        "flex flex-col group px-2 pb-4",
        type === "ERROR" && "text-red-700 dark:text-red-500",
      )}
    >
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src={"/logoipsum-401.svg"}
          alt="Vibe"
          width={18}
          height={18}
          className="shrink-0 rounded-full"
        />
        <span className="text-sm font-medium">Vibe</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
        <span>{content}</span>
        {fragment && type === "RESULT" && (
          <FragmentCard
            fragment={fragment}
            isActiveFragement={isActiveFragement}
            onFragmentClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  );
};

export const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
        {content}
      </Card>
    </div>
  );
};

export const MessageCard = ({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragement,
  onFragmentClick,
  type,
}: MessageCardProps) => {
  if (role === "ASSISTANT") {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        createdAt={createdAt}
        isActiveFragement={isActiveFragement}
        onFragmentClick={onFragmentClick}
        type={type}
      />
    );
  }

  return <UserMessage content={content} />;
};
