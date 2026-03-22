"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "@/components/editor/NoteEditor";
import type { Section, Note } from "@/types";

export default function EditorPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [username, setUsername] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  // 세션 확인
  useEffect(() => {
    fetch("/api/user/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      const data = await res.json();
      setUsername(data.username);
    });
  }, [router]);

  // 섹션 목록 로드
  const loadSections = useCallback(async () => {
    const res = await fetch("/api/sections");
    if (!res.ok) return;
    const data: Section[] = await res.json();
    setSections(data);
    if (data.length > 0 && !selectedSection) setSelectedSection(data[0]);
  }, [selectedSection]);

  useEffect(() => { loadSections(); }, []);

  // 노트 선택 시 내용 로드
  const selectNote = async (noteId: string) => {
    const res = await fetch(`/api/notes/${noteId}`);
    if (!res.ok) return;
    const note: Note = await res.json();
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.contentMd);
    setSaved(false);
  };

  // 노트 저장
  const saveNote = async () => {
    if (!selectedNote) return;
    setSaving(true);
    await fetch(`/api/notes/${selectedNote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: noteTitle, contentMd: noteContent }),
    });
    setSaving(false);
    setSaved(true);
    loadSections();
    setTimeout(() => setSaved(false), 2000);
  };

  // Ctrl+S 저장
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); saveNote(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedNote, noteTitle, noteContent]);

  // 새 노트 생성
  const createNote = async () => {
    if (!selectedSection) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: selectedSection.id, title: "새 노트", contentMd: "" }),
    });
    if (!res.ok) return;
    const note: Note = await res.json();
    await loadSections();
    selectNote(note.id);
  };

  // 노트 삭제
  const deleteNote = async (noteId: string) => {
    if (!confirm("이 노트를 삭제할까요?")) return;
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    setSelectedNote(null);
    setNoteContent("");
    setNoteTitle("");
    loadSections();
  };

  // 섹션 추가
  const addSection = async () => {
    if (!newSectionName.trim()) return;
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSectionName.trim() }),
    });
    if (!res.ok) return;
    setNewSectionName("");
    setAddingSection(false);
    loadSections();
  };

  // 섹션 삭제
  const deleteSection = async (sectionId: string) => {
    if (!confirm("섹션과 포함된 모든 노트를 삭제할까요?")) return;
    await fetch(`/api/sections/${sectionId}`, { method: "DELETE" });
    setSelectedSection(null);
    setSelectedNote(null);
    loadSections();
  };

  // 로그아웃
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 상단 헤더 */}
      <header className="h-12 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="노틸" className="h-5 opacity-70" />
          <span className="text-gray-300">|</span>
          {username && (
            <a
              href={`/${username}`}
              target="_blank"
              className="text-xs text-blue-600 hover:underline"
            >
              내 페이지 보기 ↗
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-gray-400">저장 중...</span>}
          {saved && <span className="text-xs text-green-600">저장됨</span>}
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 1열: 섹션 목록 */}
        <aside className="w-48 border-r border-gray-100 flex flex-col overflow-y-auto shrink-0 bg-gray-50">
          <div className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            섹션
          </div>
          <nav className="flex-1">
            {sections.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors ${
                  selectedSection?.id === s.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => { setSelectedSection(s); setSelectedNote(null); setNoteContent(""); setNoteTitle(""); }}
              >
                <span className="truncate">{s.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSection(s.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </nav>

          {/* 섹션 추가 */}
          <div className="p-2 border-t border-gray-100">
            {addingSection ? (
              <div className="flex gap-1">
                <input
                  autoFocus
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setAddingSection(false); }}
                  placeholder="섹션 이름"
                  className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded outline-none focus:border-blue-400"
                />
                <button onClick={addSection} className="text-xs text-blue-600 font-medium px-1">추가</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSection(true)}
                className="w-full text-xs text-gray-500 hover:text-gray-800 py-1 text-left px-1"
              >
                + 섹션 추가
              </button>
            )}
          </div>
        </aside>

        {/* 2열: 노트 목록 */}
        <aside className="w-56 border-r border-gray-100 flex flex-col overflow-y-auto shrink-0">
          <div className="p-3 flex items-center justify-between border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {selectedSection?.name ?? "노트"}
            </span>
            {selectedSection && (
              <button
                onClick={createNote}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + 새 노트
              </button>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto">
            {selectedSection?.notes.length === 0 && (
              <p className="text-xs text-gray-400 p-4">노트가 없습니다.</p>
            )}
            {selectedSection?.notes.map((n) => (
              <div
                key={n.id}
                className={`group flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors ${
                  selectedNote?.id === n.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => selectNote(n.id)}
              >
                <div className="min-w-0">
                  <p className={`text-sm truncate ${selectedNote?.id === n.id ? "text-blue-700 font-medium" : "text-gray-800"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.updatedAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs ml-1 shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </nav>
        </aside>

        {/* 3열: 에디터 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedNote ? (
            <>
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="text-lg font-semibold text-gray-900 outline-none flex-1 bg-transparent"
                  placeholder="노트 제목"
                />
                <button
                  onClick={saveNote}
                  disabled={saving}
                  className="ml-4 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <NoteEditor content={noteContent} onChange={setNoteContent} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-3">✏️</p>
                <p className="text-sm">섹션을 선택하고 노트를 열거나 새로 만드세요</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
