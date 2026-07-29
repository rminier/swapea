import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const allListings = searchParams.get("allListings") === "true";

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { id: identifier }
        ]
      },
      include: {
        _count: {
          select: {
            listings: true,
            followers: true,
            following: true,
            receivedRatings: true,
          }
        },
        listings: {
          where: { softDeleted: false, visibility: true },
          ...(allListings ? {} : { take: 6 }),
          orderBy: { createdAt: "desc" },
        },
        receivedRatings: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            giver: {
              select: { name: true, image: true, username: true }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const privacySettings = typeof user.privacySettings === "string" ? JSON.parse(user.privacySettings) : user.privacySettings;
    const isOwner = session?.user?.email === user.email;

    const publicProfile = {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      bio: user.bio,
      location: privacySettings?.showLocation ? user.location : null,
      reputation: user.reputation,
      joinedAt: user.createdAt,
      stats: {
        listingsCount: user._count.listings,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        tradesCount: 12,
      },
      listings: user.listings.map(l => ({
        ...l,
        images: typeof l.images === "string" ? JSON.parse(l.images) : l.images,
        tags: typeof l.tags === "string" ? JSON.parse(l.tags) : l.tags,
        user: {
          name: user.name || user.username || "User",
          reputation: user.reputation,
        },
      })),
      reviews: user.receivedRatings,
      isFollowing: false,
    };

    if (session?.user?.id && !isOwner) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          }
        }
      });
      publicProfile.isFollowing = !!follow;
    }

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
