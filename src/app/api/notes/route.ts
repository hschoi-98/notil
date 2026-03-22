import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

const schema = z.object({
  sectionId: z.string(),
  title: z.string().min(1).max(200),
  contentMd: z.string().default(""),
});

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  // 본인 섹션인지 확인
  const section = await prisma.section.findFirst({
    where: { id: parsed.data.sectionId, userId: session.userId },
  });
  if (!section) return NextResponse.json({ error: "섹션을 찾을 수 없습니다." }, { status: 404 });

  const contentHtml = renderMarkdown(parsed.data.contentMd);
  const note = await prisma.note.create({
    data: { ...parsed.data, contentHtml },
  });
  return NextResponse.json(note, { status: 201 });
}
