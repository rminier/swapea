"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ListingCondition } from "@/lib/enums";
import { useQuery } from "@tanstack/react-query";
import { isNativePlatform, takeNativePhoto, triggerHaptic } from "@/lib/capacitor";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, X, Loader2 } from "lucide-react";

import { useLanguage } from "@/components/language-provider";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  condition: z.nativeEnum(ListingCondition),
  location: z.string().min(2, "Location is required"),
});

export function ListingForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPremiumCategory, setSelectedPremiumCategory] = useState("");

  // Fetch subscription plan
  const { data: subData } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const plan = subData?.subscription?.active ? subData.subscription.plan : "FREE";
  const isPremiumTier = plan === "PREMIUM" || plan === "VIP";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      condition: "GOOD",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

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
    if (restrictedCategories.includes(values.category) && !isPremiumTier) {
      toast.error(`"${values.category}" is a premium category. Upgrade to Premium or VIP to unlock it!`, {
        action: {
          label: "Upgrade Plan",
          onClick: () => router.push("/settings"),
        },
      });
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, images, tags: [] }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create listing");
      }

      const listing = await res.json();
      await triggerHaptic();
      toast.success("Listing created successfully!");
      router.push(`/listings/${listing.id}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Something went wrong");
      console.error(error);
    }
  }

  const handleImageUpload = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);

    try {
      let imagePayload: string | undefined;

      if (isNativePlatform()) {
        imagePayload = await takeNativePhoto();
      } else if (e?.target?.files?.[0]) {
        const file = e.target.files[0];
        imagePayload = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (!imagePayload) {
        // Fallback default sample image if no file selected
        imagePayload = `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600`;
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePayload }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-brand-gradient">
          {t("new_listing.title")}
        </CardTitle>
        <CardDescription>
          {t("new_listing.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Image Upload Section */}
            <div className="space-y-3">
              <FormLabel>{t("new_listing.images")}</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Upload preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <ImagePlus className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">{t("new_listing.add_photo")}</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              <FormDescription>{t("new_listing.images_desc")}</FormDescription>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("new_listing.item_title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("new_listing.item_title_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("new_listing.category")}</FormLabel>
                    <Select 
                      onValueChange={(val) => {
                        if (!val) return;
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
                        if (restrictedCategories.includes(val) && !isPremiumTier) {
                          setSelectedPremiumCategory(val);
                          setShowUpgradeDialog(true);
                        } else {
                          field.onChange(val);
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("new_listing.select_category")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px] overflow-y-auto rounded-xl">
                        {/* Standard Categories */}
                        <SelectItem value="Clothing - Shirts">Clothing - Shirts</SelectItem>
                        <SelectItem value="Clothing - Pants">Clothing - Pants</SelectItem>
                        <SelectItem value="Clothing - Shoes">Clothing - Shoes</SelectItem>
                        <SelectItem value="Clothing - Accessories">Clothing - Accessories</SelectItem>
                        <SelectItem value="Clothing - Maternity">Clothing - Maternity</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Video Games - Accessories">Video Games - Accessories</SelectItem>
                        <SelectItem value="Video Games - Consoles">Video Games - Consoles</SelectItem>
                        <SelectItem value="Video Games - Games">Video Games - Games</SelectItem>
                        <SelectItem value="Collectibles - Cards">Collectibles - Cards</SelectItem>
                        <SelectItem value="Collectibles - Figures">Collectibles - Figures</SelectItem>
                        <SelectItem value="Collectibles - Mystery Brands">Collectibles - Mystery Brands</SelectItem>
                        <SelectItem value="Collectibles - Miscellaneous">Collectibles - Miscellaneous</SelectItem>
                        <SelectItem value="Toys">Toys</SelectItem>
                        <SelectItem value="Kids - Toys">Kids - Toys</SelectItem>
                        <SelectItem value="Kids - Baby Items">Kids - Baby Items</SelectItem>
                        <SelectItem value="Kids - Clothing">Kids - Clothing</SelectItem>
                        <SelectItem value="Health Products">Health Products</SelectItem>
                        <SelectItem value="Books - Academic">Books - Academic</SelectItem>
                        <SelectItem value="Books - Recreational">Books - Recreational</SelectItem>
                        <SelectItem value="Home - Furniture">Home - Furniture</SelectItem>
                        <SelectItem value="Home - Miscellaneous">Home - Miscellaneous</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Miscellaneous & Others">Miscellaneous & Others</SelectItem>
                        
                        {/* Premium Categories */}
                        <SelectItem value="Home Appliances">Home Appliances {!isPremiumTier && "🔒 (Premium/VIP)"}</SelectItem>
                        <SelectItem value="Jewelry">Jewelry {!isPremiumTier && "🔒 (Premium/VIP)"}</SelectItem>
                        <SelectItem value="Cars">Cars {!isPremiumTier && "🔒 (Premium/VIP)"}</SelectItem>
                        <SelectItem value="Auto Parts">Auto Parts {!isPremiumTier && "🔒 (Premium/VIP)"}</SelectItem>
                        <SelectItem value="Designer Brands">Designer / Famous Brands {!isPremiumTier && "🔒 (Premium/VIP)"}</SelectItem>
                        <SelectItem value="Real Estate">Real Estate {!isPremiumTier && "🔒 (Premium/VIP)"}</SelectItem>
                        <SelectItem value="Handcrafts">Handcrafted / Crafts {!isPremiumTier && "🔒 (Premium/VIP)"}</SelectItem>
                        <SelectItem value="Music">Music / Instruments {!isPremiumTier && "🔒 (Premium/VIP)"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("new_listing.condition")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("new_listing.select_condition")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">{t("new_listing.conditions.NEW")}</SelectItem>
                        <SelectItem value="LIKE_NEW">{t("new_listing.conditions.LIKE_NEW")}</SelectItem>
                        <SelectItem value="GOOD">{t("new_listing.conditions.GOOD")}</SelectItem>
                        <SelectItem value="FAIR">{t("new_listing.conditions.FAIR")}</SelectItem>
                        <SelectItem value="POOR">{t("new_listing.conditions.POOR")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("new_listing.location")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("new_listing.location_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("new_listing.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("new_listing.description_placeholder")}
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="w-full bg-brand-button rounded-full py-6 text-lg font-bold"
            >
              {form.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("new_listing.publishing")}</>
              ) : (
                t("new_listing.publish_button")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[450px] bg-card/90 backdrop-blur-xl border border-border/40 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🔒</span> {t("new_listing.upgrade_dialog.title")}
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed">
              {t("new_listing.upgrade_dialog.desc").replace("{category}", selectedPremiumCategory)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold leading-relaxed">
              {t("new_listing.upgrade_dialog.perks")}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="rounded-full">
              {t("new_listing.upgrade_dialog.later")}
            </Button>
            <Button 
              onClick={() => router.push("/settings")} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-full"
            >
              {t("new_listing.upgrade_dialog.upgrade")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
