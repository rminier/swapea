import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const listings = await prisma.listing.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { reports: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    const parsedListings = listings.map((listing) => ({
      ...listing,
      images: JSON.parse(listing.images),
      tags: JSON.parse(listing.tags),
    }));

    return NextResponse.json(parsedListings);
  } catch (error) {
    console.error("Admin fetch listings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
