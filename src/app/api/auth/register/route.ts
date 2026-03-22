import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isValidUsername, signToken, TOKEN_COOKIE } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
});

const DEFAULT_SECTIONS = ["자기소개", "이력서", "학습"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });

  const { username, email, password } = parsed.data;

  if (!isValidUsername(username))
    return NextResponse.json({ error: "사용할 수 없는 username입니다." }, { status: 400 });

  const exists = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (exists) {
    const field = exists.username === username ? "username" : "이메일";
    return NextResponse.json({ error: `이미 사용 중인 ${field}입니다.` }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { username, email, passwordHash } });
    await tx.section.createMany({
      data: DEFAULT_SECTIONS.map((name, i) => ({ userId: u.id, name, orderIndex: i })),
    });
    return u;
  });

  const token = signToken({ userId: user.id, username: user.username });
  const res = NextResponse.json({ username: user.username }, { status: 201 });
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
