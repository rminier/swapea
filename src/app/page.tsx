import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { ListingCondition } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/dictionaries";

export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value || "en") as "en" | "es";
  const t = await getDictionary(lang);

  const latestListingsRaw = await prisma.listing.findMany({
    where: { softDeleted: false, visibility: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      user: {
        select: {
          name: true,
          reputation: true,
        }
      }
    }
  });

  const latestListings = latestListingsRaw.map(listing => ({
    ...listing,
    images: (typeof listing.images === "string" ? JSON.parse(listing.images) : listing.images) as string[],
    tags: (typeof listing.tags === "string" ? JSON.parse(listing.tags) : listing.tags) as string[],
    condition: listing.condition as ListingCondition,
  }));

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-cyan-950/20 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] -z-10 opacity-60" />
        
        <div className="container px-4 text-center mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            {t.hero.title_part1} <br className="hidden md:block" />
            <span className="text-brand-gradient">
              {t.hero.title_not_need}
            </span> {t.hero.title_part2} <span className="text-brand-gradient-reverse">{t.hero.title_do}</span>.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full bg-brand-button text-lg px-8 h-14">
              {t.hero.start_button}
            </Button>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8 h-14 bg-background/50 backdrop-blur-sm border-border/50">
                {t.hero.explore_button}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured/Latest Listings */}
      <section className="py-16 container px-4 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{t.home.fresh_market}</h2>
          <Link href="/listings">
            <Button variant="ghost" className="group">
              {t.home.view_all}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        {latestListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {latestListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50 border-dashed">
            <p className="text-muted-foreground text-lg mb-4">{t.home.no_listings}</p>
            <Button variant="outline">{t.home.be_first_list}</Button>
          </div>
        )}
      </section>
    </div>
  );
}
