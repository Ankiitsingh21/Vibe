"use client";

import Prism from "prismjs";
import { useEffect } from "react";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup"; // html
import "prismjs/components/prism-css";
import "./code-theme.css";

interface Props {
  code: string;
  lang: string; // prism language id, e.g. "tsx", "typescript", "javascript", etc.
}

export const CodeView = ({ code, lang }: Props) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code, lang]);

  return (
    <pre className="p-4 bg-transparent border-none rounded-none m-0 text-xs sm:text-sm overflow-auto h-full w-full">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  );
};
