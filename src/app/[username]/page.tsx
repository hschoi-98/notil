import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${params.username} — 노틸` };
}

export default async function UserMainPage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
        include: { _count: { select: { notes: true } } },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <div className="flex items-center gap-2"><img src="/logo.png" alt="노틸" className="h-4 opacity-40" /><span className="font-semibold text-gray-900">{user.username}</span></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-sm text-gray-400 mb-8">{user.sections.length}개의 섹션</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.sections.map((section) => (
            <Link
              key={section.id}
              href={`/${user.username}/${encodeURIComponent(section.name)}`}
              className="group block p-6 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {section.name}
              </h2>
              <p className="mt-1 text-sm text-gray-400">노트 {section._count.notes}개</p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <a href="/" className="hover:text-gray-600 transition-colors">노틸로 만들어진 페이지</a>
      </footer>
    </div>
  );
}
