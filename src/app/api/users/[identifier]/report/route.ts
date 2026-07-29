import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const session = await getServerSession(authOptions);
  const { identifier } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reportedUser = await prisma.user.findFirst({
    where: { OR: [{ id: identifier }, { username: identifier }] }
  });

  if (!reportedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { reason, description } = await req.json();
    console.log(`User ${session.user.id} reported ${reportedUser.id} for ${reason}: ${description}`);
    return NextResponse.json({ success: true, message: "Report submitted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
