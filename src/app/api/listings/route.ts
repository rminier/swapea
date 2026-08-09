import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const listingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  category: z.string().min(1),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  location: z.string().min(2),
  images: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  isOpenTrade: z.boolean().default(true),
  acceptCategories: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = listingSchema.parse(body);

    // Fetch user's subscription
    const userSub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const plan = (userSub && userSub.active) ? userSub.plan : "FREE";

    // Enforce category lock for FREE and BASIC tiers
    const restrictedCategories = [
      "Home Appliances",
      "Jewelry",
      "Cars",
      "Auto Parts",
      "Designer Brands",
      "Real Estate",
      "Handcrafts",
      "Music"
    ];
    if ((plan === "FREE" || plan === "BASIC") && restrictedCategories.includes(validatedData.category)) {
      return NextResponse.json({ 
        error: `${validatedData.category} is a premium category. Please upgrade to a Premium or VIP membership to publish in this category.` 
      }, { status: 403 });
    }

    // Enforce monthly listing limit for FREE tier
    if (plan === "FREE") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const listingsCount = await prisma.listing.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (listingsCount >= 5) {
        return NextResponse.json({ 
          error: "Listing limit reached. Free tier is limited to 5 listings per month. Upgrade to Basic for unlimited listings!" 
        }, { status: 403 });
      }
    }

    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        images: JSON.stringify(validatedData.images),
        tags: JSON.stringify(validatedData.tags),
        acceptCategories: JSON.stringify(validatedData.acceptCategories || []),
        userId: session.user.id,
      },
    });

    const parsedListing = {
      ...listing,
      images: JSON.parse(listing.images as unknown as string),
      tags: JSON.parse(listing.tags as unknown as string),
      acceptCategories: typeof listing.acceptCategories === "string" ? JSON.parse(listing.acceptCategories) : (listing.acceptCategories || []),
    };

    return NextResponse.json(parsedListing, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Listing creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categories = searchParams.getAll("category[]");
    const conditions = searchParams.getAll("condition[]");
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "");
    const sort = searchParams.get("sort") || "newest";
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 50);
    const promotedOnly = searchParams.get("promotedOnly") === "true";
    const minReputation = parseFloat(searchParams.get("minReputation") || "0");

    const where: Record<string, unknown> = {
      softDeleted: false,
      visibility: true,
      user: {
        reputation: { gte: minReputation }
      }
    };

    // Full-text search (simplified for SQLite)
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // Multi-select filters
    if (categories.length > 0) {
      where.category = { in: categories };
    }

    if (conditions.length > 0) {
      where.condition = { in: conditions };
    }

    // Radius search (Bounding Box approximation)
    if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm)) {
      const ky = 40000 / 360;
      const kx = Math.cos(Math.PI * lat / 180.0) * ky;
      const dx = radiusKm / kx;
      const dy = radiusKm / ky;
      
      where.latitude = {
        gte: lat - dy,
        lte: lat + dy,
      };
      where.longitude = {
        gte: lng - dx,
        lte: lng + dx,
      };
    }

    if (promotedOnly) {
      where.promoted = { active: true };
    }

    // Sort options
    let orderBy: Record<string, unknown> = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "reputation") orderBy = { user: { reputation: "desc" } };
    else if (sort === "most_active") orderBy = { targetOffers: { _count: "desc" } };
    // 'relevance' and 'distance' would ideally be handled differently, 
    // but we'll fallback to newest/promoted for now.

    const listings = await prisma.listing.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [
        { promoted: { active: "desc" } }, // Boost promoted
        orderBy
      ],
      include: {
        user: {
          select: { name: true, reputation: true, image: true },
        },
        promoted: true,
        _count: {
          select: { targetOffers: true }
        }
      },
    });

    let nextCursor: string | null = null;
    if (listings.length > limit) {
      const nextItem = listings.pop();
      nextCursor = nextItem!.id;
    }

    const parsedItems = listings.map(listing => ({
      ...listing,
      images: typeof listing.images === "string" ? JSON.parse(listing.images) : listing.images,
      tags: typeof listing.tags === "string" ? JSON.parse(listing.tags) : listing.tags,
      isPromoted: !!listing.promoted?.active,
      offersCount: listing._count.targetOffers,
    }));

    // Calculate facets for the current query
    const allCategories = await prisma.listing.groupBy({
      by: ['category'],
      where: { ...where, category: undefined }, // Facets should ignore their own filter
      _count: { _all: true }
    });

    const allConditions = await prisma.listing.groupBy({
      by: ['condition'],
      where: { ...where, condition: undefined },
      _count: { _all: true }
    });

    return NextResponse.json({
      items: parsedItems,
      nextCursor,
      meta: {
        facetCounts: {
          categories: allCategories.map(c => ({ name: c.category, count: c._count._all })),
          conditions: allConditions.map(c => ({ name: c.condition, count: c._count._all })),
        }
      }
    });
  } catch (error) {
    console.error("Listing fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
