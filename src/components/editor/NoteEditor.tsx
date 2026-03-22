"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface EditorProps {
  content: string; // markdown
  onChange: (markdown: string) => void;
}

// Tiptap은 HTML 기반이므로 간단한 markdown ↔ HTML 변환 사용
// 실제로는 contentMd를 그대로 textarea에 쓰고 미리보기만 렌더링하는 방식이 더 안정적
export default function NoteEditor({ content, onChange }: EditorProps) {
  return (
    <textarea
      className="w-full h-full resize-none outline-none text-sm text-gray-800 leading-relaxed font-mono bg-transparent"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`# 제목\n\n내용을 작성하세요...\n\n- 목록 항목\n- [ ] 체크박스\n\n**굵게**, *기울임*, \`코드\``}
      spellCheck={false}
    />
  );
}
