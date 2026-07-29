import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id, softDeleted: false },
    orderBy: { createdAt: "desc" },
    include: { promoted: true },
  });

  const normalized = listings.map(l => ({
    ...l,
    images: typeof l.images === "string" ? JSON.parse(l.images) : l.images,
    tags: typeof l.tags === "string" ? JSON.parse(l.tags) : l.tags,
    isPromoted: !!l.promoted?.active,
  }));

  return NextResponse.json(normalized);
}
