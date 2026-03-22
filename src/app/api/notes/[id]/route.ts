import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

async function getOwnedNote(id: string, userId: string) {
  return prisma.note.findFirst({
    where: { id, section: { userId } },
    include: { section: true },
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const note = await getOwnedNote(params.id, session.userId);
  if (!note) return NextResponse.json({ error: "노트를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json(note);
}

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  contentMd: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const note = await getOwnedNote(params.id, session.userId);
  if (!note) return NextResponse.json({ error: "노트를 찾을 수 없습니다." }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const data: Record<string, string> = {};
  if (parsed.data.title) data.title = parsed.data.title;
  if (parsed.data.contentMd !== undefined) {
    data.contentMd = parsed.data.contentMd;
    data.contentHtml = renderMarkdown(parsed.data.contentMd);
  }

  const updated = await prisma.note.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const note = await getOwnedNote(params.id, session.userId);
  if (!note) return NextResponse.json({ error: "노트를 찾을 수 없습니다." }, { status: 404 });

  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
