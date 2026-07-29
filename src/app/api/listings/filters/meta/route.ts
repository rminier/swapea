import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const where: Record<string, unknown> = {
      softDeleted: false,
      visibility: true,
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // Note: Facet counts for categories should typically not be filtered by category itself
    // so that the user can see counts for other categories while one is selected.
    
    const categoryCounts = await prisma.listing.groupBy({
      by: ['category'],
      where: { ...where },
      _count: { _all: true }
    });

    const conditionCounts = await prisma.listing.groupBy({
      by: ['condition'],
      where: { ...where },
      _count: { _all: true }
    });

    return NextResponse.json({
      categories: categoryCounts.map(c => ({ name: c.category, count: c._count._all })),
      conditions: conditionCounts.map(c => ({ name: c.condition, count: c._count._all })),
    });
  } catch (error) {
    console.error("Meta filters error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
