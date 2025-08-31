// src/components/file-explorer.tsx
"use client";

import { TreeItem } from "@/types";
import { convertFilesToTreeItems } from "@/lib/utils";
import { useState } from "react";
import { ChevronRightIcon, ChevronDownIcon, FileIcon, FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  files: { [path: string]: string };
}

interface TreeNodeProps {
  item: TreeItem;
  level: number;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  parentPath?: string;
}

const TreeNode = ({ 
  item, 
  level, 
  onFileSelect, 
  selectedFile, 
  expandedFolders, 
  onToggleFolder,
  parentPath = "" 
}: TreeNodeProps) => {
  if (typeof item === "string") {
    // File
    const fullPath = parentPath ? `${parentPath}/${item}` : item;
    const isSelected = selectedFile === fullPath;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-start text-left h-auto py-1 px-2 font-normal",
          "hover:bg-accent/50",
          isSelected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
        onClick={() => onFileSelect(fullPath)}
      >
        <FileIcon className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
        <span className="truncate">{item}</span>
      </Button>
    );
  }

  // Folder
  const [folderName, ...children] = item;
  const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
  const isExpanded = expandedFolders.has(fullPath);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-left h-auto py-1 px-2 font-normal hover:bg-accent/50"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onToggleFolder(fullPath)}
      >
        {isExpanded ? (
          <ChevronDownIcon className="w-4 h-4 mr-1 shrink-0" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 mr-1 shrink-0" />
        )}
        <FolderIcon className="w-4 h-4 mr-2 text-amber-500 shrink-0" />
        <span className="truncate">{folderName}</span>
      </Button>
      {isExpanded && (
        <div>
          {children.map((child, index) => (
            <TreeNode
              key={index}
              item={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              parentPath={fullPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer = ({ files }: Props) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  const treeItems = convertFilesToTreeItems(files);
  const selectedFileContent = selectedFile ? files[selectedFile] : null;

  const handleToggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  return (
    <div className="flex h-full">
      {/* File Tree - Fixed width */}
      <div className="w-80 border-r bg-sidebar/30 flex flex-col">
        <div className="p-3 border-b bg-sidebar/50">
          <h3 className="text-sm font-medium">Files</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {treeItems.map((item, index) => (
              <TreeNode
                key={index}
                item={item}
                level={0}
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                expandedFolders={expandedFolders}
                onToggleFolder={handleToggleFolder}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Code Viewer - Flexible width */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedFile && selectedFileContent ? (
          <>
            <div className="p-3 border-b bg-sidebar/50">
              <h3 className="text-sm font-medium truncate">{selectedFile}</h3>
            </div>
            <ScrollArea className="flex-1">
              <pre className="p-4 text-sm overflow-x-auto">
                <code>{selectedFileContent}</code>
              </pre>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a file to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};