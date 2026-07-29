import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update boostedUntil for 7 days
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        boostedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days (Profile Boost)
      },
    });

    return NextResponse.json({ success: true, boostedUntil: user.boostedUntil });
  } catch (error) {
    console.error("Profile boost error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
