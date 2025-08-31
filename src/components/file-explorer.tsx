"use client";

import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";

import { Hint } from "./hint";
import { Button } from "./ui/button";
import { CodeView } from "./code-view";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";

type FileCollection = { [path: string]: string };

function getLanguageFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "text";
  // Map to Prism language IDs
  const map: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    json: "json",
    css: "css",
    scss: "scss",
    html: "markup",
    md: "markdown",
    txt: "text",
  };
  return map[ext] ?? ext;
}

interface FileBreadCrumbsProps {
  filePath: string;
}

const FileBreadcrumb = ({ filePath }: FileBreadCrumbsProps) => {
  const pathSegments = filePath.split("/");
  const maxSegments = 4;

  const renderBreadcrumbItems = () => {
    if (pathSegments.length <= maxSegments) {
      return pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;
        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">{segment}</BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    } else {
      const firstSegment = pathSegments[0];
      const lastSegment = pathSegments[pathSegments.length - 1];
      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">{firstSegment}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{lastSegment}</BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  );
};

interface Props {
  files: FileCollection;
}

export const FileExproper = ({ files }: Props) => {
  const [copy, setCopy] = useState(false);

  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const treeData = useMemo(() => convertFilesToTreeItems(files), [files]);

  const handleFileSelect = useCallback(
    (filePath: string) => {
      if (filePath in files) setSelectedFile(filePath);
    },
    [files]
  );

  const handleCopy = useCallback(() => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile] ?? "");
      setCopy(true);
      setTimeout(() => setCopy(false), 2000);
    }
  }, [selectedFile, files]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Left: Tree */}
      <ResizablePanel
        defaultSize={30}
        minSize={24}
        className="bg-sidebar flex flex-col overflow-hidden"
      >
        <div className="h-full overflow-auto">
          <TreeView
            data={treeData}
            value={selectedFile}
            onSelect={handleFileSelect}
          />
        </div>
      </ResizablePanel>

      <ResizableHandle className="hover:bg-primary transition-colors" />

      {/* Right: Code */}
      <ResizablePanel defaultSize={70} minSize={40} className="flex flex-col">
        {selectedFile && selectedFile in files ? (
          <div className="h-full w-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2 shrink-0">
              <FileBreadcrumb filePath={selectedFile} />
              <Hint text="Copy to Clipboard" side="bottom">
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="ml-auto"
                  onClick={handleCopy}
                  disabled={copy}
                >
                  {copy ? <CopyCheckIcon /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <CodeView
                code={files[selectedFile] ?? ""}
                lang={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to view its content
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
