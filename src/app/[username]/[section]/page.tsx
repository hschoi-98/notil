import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface Props {
  params: { username: string; section: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sectionName = decodeURIComponent(params.section);
  return { title: `${sectionName} — ${params.username} | 노틸` };
}

export default async function SectionPage({ params }: Props) {
  const sectionName = decodeURIComponent(params.section);

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!user) notFound();

  const section = await prisma.section.findFirst({
    where: { userId: user.id, name: sectionName },
    include: {
      notes: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!section) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 + 섹션 메뉴 */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-6">
          {/* 상단: 유저명 */}
          <div className="h-12 flex items-center gap-2">
            <Link
              href={`/${user.username}`}
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {user.username}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 text-sm">{sectionName}</span>
          </div>
          {/* 섹션 탭 메뉴 */}
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {user.sections.map((s) => (
              <Link
                key={s.id}
                href={`/${user.username}/${encodeURIComponent(s.name)}`}
                className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  s.name === sectionName
                    ? "border-gray-900 text-gray-900 font-medium"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {s.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {section.notes.length === 0 ? (
          <p className="text-gray-400 text-sm">아직 작성된 노트가 없습니다.</p>
        ) : (
          <div className="space-y-14">
            {section.notes.map((note) => (
              <article key={note.id}>
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  {note.title}
                </h2>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: note.contentHtml }}
                />
                <p className="mt-6 text-xs text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <a href="/" className="hover:text-gray-600 transition-colors">노틸로 만들어진 페이지</a>
      </footer>
    </div>
  );
}
