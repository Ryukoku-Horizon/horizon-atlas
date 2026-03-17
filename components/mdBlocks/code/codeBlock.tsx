"use client";

import { assignCss } from "@/lib/assignCssProperties";
import Prism, { Token } from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-java"
import "prismjs/components/prism-go"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"
import "prismjs/components/prism-kotlin"
import "prismjs/components/prism-swift"
import "prismjs/components/prism-json"
import "prismjs/components/prism-lua"
import "prismjs/components/prism-php"
import "prismjs/components/prism-docker"
import "prismjs/components/prism-powershell"
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import { RenderTextWithBreaks } from "./renderTextWithBreaks";
import React, { useState } from "react";
import PlainTextCode from "./languages/plainText";
import { AtlRichTextEntity } from "@/types/pageData";
import { FaRegClipboard,FaClipboardCheck } from "react-icons/fa";

export default function CodeBlock({
  parents,
  language,
  codeContent
}: {
  parents: AtlRichTextEntity[];
  language: string;
  codeContent:string
}) {
    const [copied, setCopied] = useState(false);
    const [isHovered,setIsHovered] = useState(false)

    if(language=="plain text") return <PlainTextCode parent={parents} />
    const lan = safePrismLanguage(language)
    const code = parents.map((p) => p.plain_text).join("");

    const handleCopy = async () => {
      try {
          await navigator.clipboard.writeText(codeContent);
          console.log("codeContent",codeContent)
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      } catch (error) {
          console.error('Failed to copy:', error);
      }
    };

  try{

  const notionStyles = parents.flatMap((p) => {
    const style = assignCss(p);
    return [...p.plain_text].map(() => style);
  });

  let index = 0; 

  function renderToken(token:Prism.Token): React.ReactNode {
    if (typeof token === "string") {
      const styled = [...token].map((char) => {
        const style = notionStyles[index++] || {};
        return RenderTextWithBreaks(char, style);
      });
      return <>{styled}</>;
    }

    return (
      <span className={`token ${token.type}`} key={index}>
        {Array.isArray(token.content)
          ? token.content.map((t, i) => <React.Fragment key={i}>{renderToken(t as Prism.Token)}</React.Fragment>)
          : renderToken(token.content as Prism.Token)}
      </span>
    );
  }
  const lines = code.split("\n").map((line) => {
  return {
    text: line,
    tokens: Prism.tokenize(line, Prism.languages[lan]),
  };
});


  return (
  /* 1. 全体を包むコンテナを relative にする */
  <div 
    className="relative group" // groupを追加してホバー判定をここで行う
    onMouseEnter={() => setIsHovered(true)} 
    onMouseLeave={() => setIsHovered(false)}
  >
    {/* 2. 言語ラベルとコピーボタンは pre の外に出す */}
    <span className="absolute top-2 left-3 z-10 rounded-md bg-gray-200 px-2 py-0.5 text-[10px] text-gray-600">
      {language}
    </span>

    {isHovered && (
      <button
        onClick={handleCopy}
        className="absolute top-2 right-4 z-10 px-2 py-1 text-xs bg-white/50 rounded-md shadow-sm" // z-10で前面に出す
      >
        {copied ? <FaClipboardCheck size={20} color="#696969" /> : <FaRegClipboard size={20} color="#c0c0c0" />}
      </button>
    )}

    {/* 3. pre はスクロール専用にする */}
    <pre
      className={`
        language-${lan}
        p-4
        pl-2
        overflow-x-auto
        text-sm
        leading-relaxed
        font-mono
        m-0
        rounded-br-lg
        rounded-bl-lg
      `}
      style={{ backgroundColor: "rgb(250,250,250)" }}
    >
      <div className="mt-7">
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className="group flex hover:bg-gray-100/70 rounded-md">
            <span className="select-none shrink-0 text-xs text-gray-400 cursor-default group-hover:text-gray-600 w-6 text-right pr-3 pt-1.5">
              {lineIndex + 1}
            </span>
            {line.tokens.map((token, i) => (
              <React.Fragment key={i}>{renderToken(token as Token)}</React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </pre>
  </div>
);
  }catch{
    console.log("未読み込み:",lan)
    return (
        <PlainTextCode parent={parents} />
    )
  }
}


function safePrismLanguage(lang: string) {
  const normalized = normalizeLanguage(lang);

  if (Prism.languages[normalized]) {
    return normalized;
  }

  console.warn(`Prism language "${normalized}" is not loaded. Falling back to "plain".`);
  return "plain";
}

// html → markup などの変換
function normalizeLanguage(lang: string): string {
  switch (lang) {
    case "html":
    case "xml":
    case "svg":
        return "markup";
    case "js":
        return "javascript";
    case "ts":
        return "typescript";
    case "c++":
        return "cpp"
    case "c#":
        return "csharp"
    case "zsh":
        return "bash"
    default:
      return lang.toLowerCase();
  }
}