import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const sections = await prisma.section.findMany({
    where: { userId: session.userId },
    orderBy: { orderIndex: "asc" },
    include: {
      notes: { select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: "desc" } },
    },
  });
  return NextResponse.json(sections);
}

const createSchema = z.object({ name: z.string().min(1).max(50) });

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "섹션 이름을 입력해주세요." }, { status: 400 });

  const last = await prisma.section.findFirst({
    where: { userId: session.userId },
    orderBy: { orderIndex: "desc" },
  });

  const section = await prisma.section.create({
    data: { userId: session.userId, name: parsed.data.name, orderIndex: (last?.orderIndex ?? -1) + 1 },
    include: { notes: true },
  });
  return NextResponse.json(section, { status: 201 });
}
