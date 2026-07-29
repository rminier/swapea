"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MapPin, Calendar, Star, MessageSquare, UserPlus, UserMinus, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { ReportDialog } from "./report-dialog";

interface ProfileHeaderUser {
  id: string;
  name: string;
  username: string;
  image?: string | null;
  reputation: number;
  location?: string | null;
  joinedAt?: string | null;
  isFollowing?: boolean;
  bio?: string | null;
  stats: {
    followersCount: number;
    followingCount: number;
  };
}

interface ProfileHeaderProps {
  user: ProfileHeaderUser;
  isOwner: boolean;
}

export function ProfileHeader({ user, isOwner }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [followersCount, setFollowersCount] = useState<number>(user.stats.followersCount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFollow = async () => {
    setIsSubmitting(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${user.id}/follow`, { method });
      
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
        toast.success(isFollowing ? `Unfollowed ${user.name}` : `Following ${user.name}`);
      } else {
        toast.error("Failed to update follow status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative pb-10 border-b border-border/50">
      {/* Cover Background */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-pink-500/30 rounded-b-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.2),transparent)]" />
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl" />
      </div>
      
      <div className="container max-w-6xl mx-auto px-4">
        <div className="relative -mt-24 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6 flex-1">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <Avatar className="h-40 w-40 border-8 border-background shadow-2xl rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                <AvatarImage src={user.image || undefined} className="object-cover animate-fade-in" />
                <AvatarFallback className="text-5xl font-black bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-heading tracking-wider flex items-center justify-center">
                  {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-background shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
   
            {/* Info */}
            <div className="flex-1 space-y-4 mb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight font-heading">{user.name}</h1>
                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-0 font-bold px-3 py-1">
                  @{user.username}
                </Badge>
                {user.reputation >= 4.5 && (
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold px-3 py-1 gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Top Rated
                  </Badge>
                )}
              </div>
   
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground font-semibold">
                {user.location && (
                  <div className="flex items-center gap-1.5 bg-muted/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/30">
                    <MapPin className="h-4 w-4 text-primary" />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-muted/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/30">
                  <Calendar className="h-4 w-4 text-primary" />
                  Joined {user.joinedAt ? format(new Date(user.joinedAt), "MMMM yyyy") : "Recently"}
                </div>
                <div className="flex items-center gap-4 bg-muted/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border/30">
                  <div className="flex items-center gap-1">
                    <span className="text-foreground font-bold">{followersCount}</span>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">followers</span>
                  </div>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-foreground font-bold">{user.stats.followingCount}</span>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">following</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-2 flex-wrap lg:self-end">
            {isOwner ? (
              <Button render={<Link href="/profile/edit" />} className="rounded-2xl font-bold px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleFollow}
                  disabled={isSubmitting}
                  variant={isFollowing ? "outline" : "default"}
                  className="rounded-2xl font-bold px-8 py-6 text-lg transition-all min-w-[140px]"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="mr-2 h-5 w-5" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Follow
                    </>
                  )}
                </Button>
                <Button variant="secondary" className="rounded-2xl font-bold px-6 py-6 text-lg hover:bg-muted/80">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <ReportDialog userId={user.id} userName={user.name} />
              </>
            )}
          </div>
        </div>
        
        {user.bio && (
          <p className="mt-8 text-lg text-muted-foreground max-w-3xl leading-relaxed italic">
            &ldquo;{user.bio}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
