import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const suggestions = await prisma.listing.findMany({
      where: {
        softDeleted: false,
        visibility: true,
        OR: [
          { title: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 8,
      select: {
        title: true,
        category: true,
      },
    });

    // Extract unique titles and categories
    const results = Array.from(new Set([
      ...suggestions.map(s => s.title),
      ...suggestions.map(s => s.category)
    ])).slice(0, 5);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
