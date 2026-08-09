import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete user (Prisma cascade deletion handles listings, offers, ratings, sessions, notifications)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
