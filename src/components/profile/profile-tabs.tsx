"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCardEnhanced } from "@/components/listings/listing-card-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Star, MessageSquare, History, Package, Award, ShieldCheck } from "lucide-react";

interface ReviewGiver {
  name: string;
  username?: string;
  image?: string | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  giver: ReviewGiver;
}

interface ListingItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  user: {
    name: string;
    reputation: number;
    username?: string | null;
  };
}

interface ProfileTabsUser {
  reputation: number;
  stats: {
    listingsCount: number;
    tradesCount: number;
  };
  listings: ListingItem[];
  reviews: ReviewItem[];
}

interface ProfileTabsProps {
  user: ProfileTabsUser;
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-8">
      <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border/50">
        <TabsTrigger value="overview" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
        <TabsTrigger value="listings" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Listings ({user.stats.listingsCount})</TabsTrigger>
        <TabsTrigger value="reviews" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Reviews ({user.reviews.length})</TabsTrigger>
        <TabsTrigger value="activity" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Recent Listings Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold font-heading flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Featured Listings
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
              {user.listings.slice(0, 2).map((listing) => (
                <ListingCardEnhanced key={listing.id} listing={listing} hideUser />
              ))}
            </div>
          </div>

          {/* Recent Reviews Preview */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-heading flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Recent Feedback
            </h3>
            <div className="space-y-4">
              {user.reviews.length > 0 ? (
                user.reviews.slice(0, 3).map((review) => (
                  <Card key={review.id} className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden rounded-2xl">
                    <CardContent className="p-6 flex gap-4">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={review.giver.image || undefined} />
                        <AvatarFallback>{review.giver.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{review.giver.name}</span>
                          <div className="flex items-center text-amber-500 font-bold text-sm">
                            <Star className="h-3 w-3 fill-current mr-1" />
                            {review.rating}
                          </div>
                        </div>
                        <p className="text-muted-foreground italic text-sm">&ldquo;{review.comment}&rdquo;</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                  No feedback received yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Stats Sidebar */}
          <Card className="border-border/40 bg-card/45 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl shadow-muted/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
              <CardTitle className="font-heading text-lg font-black flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500 animate-pulse" />
                Trust Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Reputation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reputation</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-foreground">{user.reputation.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-4 w-4",
                        i < Math.round(user.reputation) 
                          ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" 
                          : "text-muted-foreground/30"
                      )} 
                    />
                  ))}
                </div>
              </div>

              {/* Trades */}
              <div className="space-y-2 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed Trades</span>
                  <span className="text-xl font-black text-foreground">{user.stats.tradesCount}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">Top 15% of active Swapea traders</p>
              </div>

              {/* Response Rate */}
              <div className="space-y-2 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Response Rate</span>
                  <span className="text-xl font-black text-green-500">98%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Ultra Fast responder</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Verified Account Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white space-y-4 shadow-xl shadow-indigo-900/10 border border-indigo-500/20 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
            <h4 className="font-heading font-black text-lg flex items-center gap-2 text-indigo-200">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              Verified Account
            </h4>
            <p className="text-xs text-indigo-200/80 leading-relaxed font-medium">
              This user has verified their identity through our secure verification process, ensuring safe trading.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="listings">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {user.listings.map((listing) => (
            <ListingCardEnhanced key={listing.id} listing={listing} hideUser />
          ))}
        </div>
        {user.listings.length === 0 && (
          <div className="py-24 text-center text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
            This user has no active listings.
          </div>
        )}
      </TabsContent>

      <TabsContent value="reviews">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.reviews.map((review) => (
            <Card key={review.id} className="border-border/50 bg-card/30 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6 flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={review.giver.image || undefined} />
                  <AvatarFallback>{review.giver.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{review.giver.name}</p>
                      <p className="text-xs text-muted-foreground">@{review.giver.username}</p>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      {review.rating}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold pt-2">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="activity">
        <div className="space-y-4">
          <h3 className="text-xl font-bold font-heading flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Recent Trading History
          </h3>
          <div className="space-y-3">
             <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">Traded MacBook Pro 14</p>
                    <p className="text-xs text-muted-foreground">Received iPad Pro 12.9 in exchange</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-bold">COMPLETED</Badge>
             </div>
             {/* Repeat or placeholder for more activities */}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
