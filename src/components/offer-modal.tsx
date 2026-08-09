"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { useLanguage } from "@/components/language-provider";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, X, Loader2, Package, Sparkles } from "lucide-react";
import { isNativePlatform, takeNativePhoto } from "@/lib/capacitor";

interface OfferModalProps {
  targetListingId: string;
  targetListingTitle: string;
  trigger?: React.ReactElement;
}

interface UserListing {
  id: string;
  title: string;
  images: string[];
}

export function OfferModal({ targetListingId, targetListingTitle, trigger }: OfferModalProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"inventory" | "custom">("inventory");
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customImage, setCustomImage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, language } = useLanguage();

  const handleCustomImageUpload = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploadingImage(true);
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

      if (!imagePayload) return;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePayload }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
        setCustomImage(data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(language === "es" ? "Error al subir la fotografía" : "Failed to upload photo");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Fetch current user's listings to use in the offer
  const { data: myListings, isLoading } = useQuery<UserListing[]>({
    queryKey: ["myListings"],
    queryFn: async () => {
      const res = await fetch("/api/me/listings");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: open,
  });

  const handleOffer = async () => {
    if (tab === "inventory" && selectedListings.length === 0) {
      toast.error(language === "es" ? "Por favor selecciona al menos un artículo de tu inventario." : "Please select at least one item from your inventory.");
      return;
    }

    if (tab === "custom" && (!customTitle.trim() || !customDesc.trim())) {
      toast.error(language === "es" ? "Título y descripción son requeridos para artículos personalizados." : "Title and description are required for custom items.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bodyPayload = tab === "inventory" ? {
        targetListingId,
        offeredListingIds: selectedListings,
      } : {
        targetListingId,
        customItemTitle: customTitle.trim(),
        customItemDescription: customDesc.trim(),
        customItemImage: customImage.trim() || null,
      };

      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to make offer");
      }

      toast.success(language === "es" ? "¡Oferta enviada con éxito!" : "Offer sent successfully!");
      setOpen(false);
      setSelectedListings([]);
      setCustomTitle("");
      setCustomDesc("");
      setCustomImage("");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedListings(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-bold">{t("listing_detail.make_offer")}</Button>} />
      <DialogContent className="sm:max-w-[520px] bg-card/95 backdrop-blur-xl border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading">{t("listing_detail.make_offer")}</DialogTitle>
          <DialogDescription className="text-xs">
            {language === "es" 
              ? `Propón un artículo de tu inventario o describe cualquier artículo para intercambiar por "${targetListingTitle}".` 
              : `Offer an item from your inventory or propose any unlisted item for "${targetListingTitle}".`}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={(val) => setTab(val as "inventory" | "custom")} className="w-full py-2">
          <TabsList className="grid grid-cols-2 w-full rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="inventory" className="rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              {language === "es" ? "Mi Inventario" : "My Inventory"}
            </TabsTrigger>
            <TabsTrigger value="custom" className="rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              {language === "es" ? "Ofrecer Algo Más" : "Offer Unlisted Item"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="pt-3">
            {isLoading ? (
              <div className="flex justify-center p-6"><div className="animate-pulse w-6 h-6 rounded-full bg-muted"></div></div>
            ) : myListings?.length === 0 ? (
              <div className="text-center p-6 bg-muted/20 rounded-xl space-y-3">
                <p className="text-xs text-muted-foreground">
                  {language === "es" ? "No tienes anuncios creados en tu inventario." : "You don't have any listed items in your inventory yet."}
                </p>
                <p className="text-xs font-bold text-purple-400">
                  {language === "es" ? "¡Puedes usar la pestaña 'Ofrecer Algo Más' para proponer cualquier artículo sin registrarlo!" : "Tip: You can use 'Offer Unlisted Item' to trade anything without creating a listing!"}
                </p>
                <Button render={<Link href="/listings/new" />} variant="outline" size="sm" className="rounded-full font-bold">
                  {t("navbar.new_listing")}
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[260px] pr-3">
                <div className="space-y-3">
                  {myListings?.map((listing) => (
                    <div 
                      key={listing.id} 
                      className={`flex items-center space-x-3.5 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedListings.includes(listing.id) ? "border-purple-500 bg-purple-500/10" : "border-border/40 hover:border-purple-500/40"
                      }`}
                      onClick={() => toggleSelection(listing.id)}
                    >
                      <Checkbox 
                        checked={selectedListings.includes(listing.id)}
                        onCheckedChange={() => toggleSelection(listing.id)}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={listing.images[0] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100"} alt={listing.title} className="w-14 h-14 object-cover rounded-lg border border-border/30" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-2">{listing.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="custom" className="pt-3 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {language === "es" ? "Título del Artículo *" : "Item Title *"}
              </label>
              <Input
                placeholder={language === "es" ? "ej. Bicleta de Montaña 21 Velocidades" : "e.g., 21-Speed Mountain Bike"}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {language === "es" ? "Descripción *" : "Description *"}
              </label>
              <Textarea
                placeholder={language === "es" ? "Describe el estado del artículo, marca, accesorios incluidos..." : "Describe condition, specs, brand, included accessories..."}
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="rounded-xl text-sm resize-none h-20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {language === "es" ? "Fotografía del Artículo (Opcional)" : "Item Photo (Optional)"}
              </label>
              {customImage ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border/60 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={customImage} alt="Uploaded item" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => setCustomImage("")}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border/70 hover:border-purple-500 hover:bg-purple-500/5 transition-colors cursor-pointer text-xs font-semibold">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCustomImageUpload}
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage ? (
                    <><Loader2 className="h-4 w-4 animate-spin text-purple-400" /> {language === "es" ? "Subiendo fotografía..." : "Uploading photo..."}</>
                  ) : (
                    <><ImagePlus className="h-4 w-4 text-purple-400" /> {language === "es" ? "Subir o Tomar Fotografía" : "Upload or Take Photo"}</>
                  )}
                </label>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full font-bold">{t("common.cancel")}</Button>
          <Button 
            onClick={handleOffer} 
            disabled={isSubmitting || (tab === "inventory" && selectedListings.length === 0) || (tab === "custom" && (!customTitle.trim() || !customDesc.trim()))}
            className="bg-brand-button rounded-full font-bold"
          >
            {isSubmitting ? "..." : (language === "es" ? "Enviar Oferta" : "Send Offer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
