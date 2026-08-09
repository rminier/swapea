import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { TradeStatus } from "@/lib/enums";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "CANCELLED", "COUNTERED"]),
  offeredListingIds: z.array(z.string()).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, offeredListingIds } = statusSchema.parse(body);

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { targetListing: true },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Authorization checks
    if (status === "ACCEPTED" || status === "DECLINED") {
      // If the offer is countered, only the original proposer can accept/decline
      if (offer.status === "COUNTERED") {
        if (offer.proposingUserId !== session.user.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      } else {
        // If pending, only the target listing owner can accept/decline
        if (offer.targetListing.userId !== session.user.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      }
    } else if (status === "CANCELLED") {
      // Only proposer can cancel
      if (offer.proposingUserId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (status === "COUNTERED") {
      // Only target listing owner can counter
      if (offer.targetListing.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    if (offer.status !== "PENDING" && offer.status !== "COUNTERED") {
      return NextResponse.json({ error: "Offer is no longer active" }, { status: 400 });
    }

    let updatedOffer;
    if (status === "COUNTERED") {
      if (!offeredListingIds || offeredListingIds.length === 0) {
        return NextResponse.json({ error: "Offered listings are required for a counter offer" }, { status: 400 });
      }

      // Verify offered listings belong to the original proposer and are active
      const proposerListings = await prisma.listing.findMany({
        where: {
          id: { in: offeredListingIds },
          userId: offer.proposingUserId,
          softDeleted: false,
        },
      });

      if (proposerListings.length !== offeredListingIds.length) {
        return NextResponse.json({ error: "One or more offered listings are invalid" }, { status: 400 });
      }

      updatedOffer = await prisma.offer.update({
        where: { id },
        data: {
          status: "COUNTERED",
          offeredListings: {
            set: offeredListingIds.map(id => ({ id })),
          },
        },
      });

      // Create notification for the proposer
      await prisma.notification.create({
        data: {
          userId: offer.proposingUserId,
          type: "COUNTER_OFFER",
          content: `Your offer on "${offer.targetListing.title}" has been countered.`,
          link: `/offers`,
        }
      });
    } else {
      updatedOffer = await prisma.offer.update({
        where: { id },
        data: { status },
      });

      // If accepted, create a Trade and return tradeId for immediate chat redirection
      if (status === "ACCEPTED") {
        const existingTrade = await prisma.trade.findUnique({
          where: { offerId: offer.id }
        });
        const trade = existingTrade || await prisma.trade.create({
          data: {
            offerId: offer.id,
            status: TradeStatus.ACTIVE,
          },
        });

        // Notify proposing user
        await prisma.notification.create({
          data: {
            userId: offer.proposingUserId,
            type: "OFFER_ACCEPTED",
            content: `Your trade offer on "${offer.targetListing.title}" was accepted! Open trade room to chat.`,
            link: `/trades/${trade.id}`,
          }
        });

        return NextResponse.json({ ...updatedOffer, tradeId: trade.id });
      }
    }

    return NextResponse.json(updatedOffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Update offer status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
