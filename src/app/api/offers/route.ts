import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const offerSchema = z.object({
  targetListingId: z.string(),
  offeredListingIds: z.array(z.string()).min(1),
  priority: z.boolean().optional().default(false),
  protected: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetListingId, offeredListingIds, priority, protected: isProtected } = offerSchema.parse(body);

    // Fetch user's subscription
    const userSub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const plan = (userSub && userSub.active) ? userSub.plan : "FREE";

    // Enforce monthly offer limit for FREE tier
    if (plan === "FREE") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const offersCount = await prisma.offer.count({
        where: {
          proposingUserId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (offersCount >= 5) {
        return NextResponse.json({ 
          error: "Offer limit reached. Free tier is limited to 5 offers per month. Upgrade to Basic for unlimited offers!" 
        }, { status: 403 });
      }
    }

    // Verify target listing exists
    const targetListing = await prisma.listing.findUnique({
      where: { id: targetListingId },
    });

    if (!targetListing || targetListing.softDeleted) {
      return NextResponse.json({ error: "Target listing not found" }, { status: 404 });
    }

    if (targetListing.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot make offer on your own listing" }, { status: 400 });
    }

    // Verify offered listings belong to user and are valid
    const offeredListings = await prisma.listing.findMany({
      where: {
        id: { in: offeredListingIds },
        userId: session.user.id,
        softDeleted: false,
      },
    });

    if (offeredListings.length !== offeredListingIds.length) {
      return NextResponse.json({ error: "One or more offered listings are invalid" }, { status: 400 });
    }

    // Create the offer
    const offer = await prisma.offer.create({
      data: {
        proposingUserId: session.user.id,
        targetListingId,
        priority,
        protected: isProtected,
        offeredListings: {
          connect: offeredListingIds.map(id => ({ id })),
        },
      },
    });

    // Create notification for the target listing owner
    await prisma.notification.create({
      data: {
        userId: targetListing.userId,
        type: "OFFER",
        content: `You have received a new offer on "${targetListing.title}"`,
        link: `/offers`, // We will build the offers management page
      }
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Offer creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "received"; // received or sent

    let offers;
    if (type === "received") {
      offers = await prisma.offer.findMany({
        where: { targetListing: { userId: session.user.id } },
        include: {
          targetListing: true,
          proposingUser: { select: { name: true, image: true, reputation: true } },
          offeredListings: true,
          trade: true,
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" }
        ],
      });
    } else {
      offers = await prisma.offer.findMany({
        where: { proposingUserId: session.user.id },
        include: {
          targetListing: { include: { user: { select: { name: true, image: true, reputation: true } } } },
          offeredListings: true,
          trade: true,
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" }
        ],
      });
    }

    const parsedOffers = offers.map((offer) => ({
      ...offer,
      targetListing: {
        ...offer.targetListing,
        images: JSON.parse(offer.targetListing.images),
        tags: JSON.parse(offer.targetListing.tags),
      },
      offeredListings: offer.offeredListings.map((l) => ({
        ...l,
        images: JSON.parse(l.images),
        tags: JSON.parse(l.tags),
      }))
    }));

    return NextResponse.json(parsedOffers);
  } catch (error) {
    console.error("Fetch offers error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
