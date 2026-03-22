import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const section = await prisma.section.findFirst({ where: { id: params.id, userId: session.userId } });
  if (!section) return NextResponse.json({ error: "섹션을 찾을 수 없습니다." }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const updated = await prisma.section.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const section = await prisma.section.findFirst({ where: { id: params.id, userId: session.userId } });
  if (!section) return NextResponse.json({ error: "섹션을 찾을 수 없습니다." }, { status: 404 });

  await prisma.section.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
