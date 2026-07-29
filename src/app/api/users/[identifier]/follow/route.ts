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

  // Find user by identifier (ID or username)
  const userToFollow = await prisma.user.findFirst({
    where: { OR: [{ id: identifier }, { username: identifier }] }
  });

  if (!userToFollow) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (session.user.id === userToFollow.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  try {
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: userToFollow.id,
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Already following" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const session = await getServerSession(authOptions);
  const { identifier } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userToUnfollow = await prisma.user.findFirst({
    where: { OR: [{ id: identifier }, { username: identifier }] }
  });

  if (!userToUnfollow) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userToUnfollow.id,
        }
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Not following" }, { status: 400 });
  }
}
