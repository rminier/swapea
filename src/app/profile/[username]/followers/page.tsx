import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      followers: {
        include: {
          follower: {
            select: { name: true, username: true, image: true, bio: true }
          }
        }
      },
      following: {
        include: {
          following: {
            select: { name: true, username: true, image: true, bio: true }
          }
        }
      }
    }
  });

  if (!user) notFound();

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10">
        <Link href={`/profile/${username}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          ← Back to @{username}&apos;s profile
        </Link>
        <h1 className="text-3xl font-black tracking-tight font-heading mt-4">Community</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Followers
            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {user.followers.length}
            </span>
          </h2>
          <div className="space-y-4">
            {user.followers.map((f) => (
              <Card key={f.follower.username} className="border-border/50 bg-card/30 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={f.follower.image || undefined} />
                    <AvatarFallback>{f.follower.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${f.follower.username}`} className="font-bold hover:underline block truncate">
                      {f.follower.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{f.follower.username}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full h-8">View</Button>
                </CardContent>
              </Card>
            ))}
            {user.followers.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No followers yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Following
            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {user.following.length}
            </span>
          </h2>
          <div className="space-y-4">
            {user.following.map((f) => (
              <Card key={f.following.username} className="border-border/50 bg-card/30 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={f.following.image} />
                    <AvatarFallback>{f.following.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${f.following.username}`} className="font-bold hover:underline block truncate">
                      {f.following.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{f.following.username}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full h-8">View</Button>
                </CardContent>
              </Card>
            ))}
            {user.following.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Not following anyone yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
