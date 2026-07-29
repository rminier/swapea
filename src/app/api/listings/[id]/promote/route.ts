import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify listing ownership and existence
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing || listing.softDeleted) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "You do not own this listing" }, { status: 403 });
    }

    // Verify VIP subscription
    const userSub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const isVip = userSub?.active && userSub.plan === "VIP";

    if (!isVip) {
      return NextResponse.json({ error: "VIP membership is required to promote listings." }, { status: 403 });
    }

    // Create or update the promoted listing
    const promoted = await prisma.promotedListing.upsert({
      where: { listingId: id },
      update: {
        active: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      create: {
        listingId: id,
        active: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return NextResponse.json({ success: true, promoted });
  } catch (error) {
    console.error("Listing promotion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
