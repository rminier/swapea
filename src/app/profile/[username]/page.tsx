import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { id: username }
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
        take: 6,
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
    notFound();
  }

  // Normalize data for components
  const normalizedUser = {
    ...user,
    stats: {
      listingsCount: user._count.listings,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      tradesCount: 12,
    },
    listings: user.listings.map(l => ({
      ...l,
      images: JSON.parse(l.images as string),
      tags: JSON.parse(l.tags as string),
      user: {
        name: user.name || user.username || "User",
        reputation: user.reputation,
      },
    })),
    reviews: user.receivedRatings,
    isFollowing: false,
  };

  if (session?.user?.id && session.user.id !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        }
      }
    });
    normalizedUser.isFollowing = !!follow;
  }

  const isOwner = session?.user?.id === user.id;

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader user={normalizedUser} isOwner={isOwner} />
      <main className="container max-w-6xl mx-auto px-4 py-12">
        <ProfileTabs user={normalizedUser} />
      </main>
    </div>
  );
}
